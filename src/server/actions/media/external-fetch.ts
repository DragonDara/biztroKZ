import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

import * as Sentry from "@sentry/nextjs"
import sharp from "sharp"

import prisma from "@/lib/prisma"
import { putObjectToR2 } from "@/lib/r2"
import { MediaAssetScope, MediaAssetType, MediaUsageEntityType } from "@/lib/types/media"
import { getCacheBustedImageUrl } from "@/lib/utils"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8 MB
const FETCH_TIMEOUT_MS = 10_000
const MAX_REDIRECTS = 3

/** Machine-readable failure reasons; the caller maps these to localized copy. */
export type ExternalImageErrorCode =
  | "invalidUrl"
  | "blockedHost"
  | "fetchFailed"
  | "notImage"
  | "tooLarge"
  | "corruptImage"
  | "uploadFailed"

export type FetchAndStoreImageResult =
  | { ok: true; assetId: string; publicUrl: string }
  | { ok: false; code: ExternalImageErrorCode }

class ExternalImageError extends Error {
  constructor(readonly code: ExternalImageErrorCode) {
    super(code)
    this.name = "ExternalImageError"
  }
}

const SHARP_FORMAT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  webp: "image/webp"
}

function ipv4ToLong(address: string): number | null {
  const parts = address.split(".")
  if (parts.length !== 4) return null
  let value = 0
  for (const part of parts) {
    const octet = Number(part)
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null
    value = value * 256 + octet
  }
  return value >>> 0
}

function isPrivateIpv4(address: string): boolean {
  const long = ipv4ToLong(address)
  if (long === null) return true // unparseable -> treat as unsafe

  const inRange = (base: string, maskBits: number) => {
    const baseLong = ipv4ToLong(base)
    if (baseLong === null) return false
    const mask = maskBits === 0 ? 0 : (0xffffffff << (32 - maskBits)) >>> 0
    return (long & mask) === (baseLong & mask)
  }

  return (
    inRange("0.0.0.0", 8) || // "this" network
    inRange("10.0.0.0", 8) ||
    inRange("100.64.0.0", 10) || // CGNAT
    inRange("127.0.0.0", 8) || // loopback
    inRange("169.254.0.0", 16) || // link-local (incl. cloud metadata)
    inRange("172.16.0.0", 12) ||
    inRange("192.0.0.0", 24) ||
    inRange("192.168.0.0", 16) ||
    inRange("198.18.0.0", 15) || // benchmarking
    inRange("224.0.0.0", 4) || // multicast
    inRange("240.0.0.0", 4) // reserved
  )
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase().split("%")[0] ?? ""

  // IPv4-mapped IPv6 (::ffff:a.b.c.d) — validate the embedded IPv4.
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped?.[1]) return isPrivateIpv4(mapped[1])

  return (
    normalized === "::" ||
    normalized === "::1" || // loopback
    normalized.startsWith("fc") || // unique local fc00::/7
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") || // link-local fe80::/10
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  )
}

function isPrivateAddress(address: string): boolean {
  const kind = isIP(address)
  if (kind === 4) return isPrivateIpv4(address)
  if (kind === 6) return isPrivateIpv6(address)
  return true // not a literal IP -> unsafe
}

/** Validate scheme + resolve DNS and reject private/internal targets (SSRF guard). */
async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new ExternalImageError("invalidUrl")
  }

  if (url.protocol !== "https:") throw new ExternalImageError("blockedHost")

  let addresses: { address: string }[]
  try {
    addresses = await lookup(url.hostname, { all: true })
  } catch {
    throw new ExternalImageError("blockedHost")
  }

  if (addresses.length === 0) throw new ExternalImageError("blockedHost")
  for (const { address } of addresses) {
    if (isPrivateAddress(address)) throw new ExternalImageError("blockedHost")
  }

  return url
}

/** Fetch following redirects manually so each hop is re-validated against the SSRF guard. */
async function fetchImageBytes(sourceUrl: string): Promise<{
  buffer: Buffer
}> {
  let currentUrl = await assertPublicUrl(sourceUrl)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let response: Response
    try {
      response = await fetch(currentUrl, {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { accept: "image/png,image/jpeg,image/webp" }
      })
    } catch {
      throw new ExternalImageError("fetchFailed")
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      if (!location) throw new ExternalImageError("fetchFailed")
      currentUrl = await assertPublicUrl(new URL(location, currentUrl).toString())
      continue
    }

    if (!response.ok || !response.body) throw new ExternalImageError("fetchFailed")

    const declaredLength = Number(response.headers.get("content-length"))
    if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
      throw new ExternalImageError("tooLarge")
    }

    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        total += value.byteLength
        if (total > MAX_IMAGE_BYTES) {
          await reader.cancel()
          throw new ExternalImageError("tooLarge")
        }
        chunks.push(value)
      }
    }

    return { buffer: Buffer.concat(chunks) }
  }

  throw new ExternalImageError("fetchFailed")
}

/**
 * Downloads an external image, re-hosts it on R2, and links a MediaAsset to the given entity.
 * Never throws — all failures are returned as typed error codes so a bad image can't abort a batch.
 */
export async function fetchAndStoreExternalImage({
  organizationId,
  entityId,
  sourceUrl
}: {
  organizationId: string
  entityId: string
  sourceUrl: string
}): Promise<FetchAndStoreImageResult> {
  try {
    const { buffer } = await fetchImageBytes(sourceUrl)

    let metadata: sharp.Metadata
    try {
      metadata = await sharp(buffer).metadata()
    } catch {
      throw new ExternalImageError("corruptImage")
    }

    const contentType = metadata.format
      ? SHARP_FORMAT_TO_MIME[metadata.format]
      : undefined
    if (!contentType) throw new ExternalImageError("notImage")

    const storageKey = `orgs/${organizationId}/menu-items/${entityId}/image`

    try {
      await putObjectToR2({ key: storageKey, body: buffer, contentType })
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "external-image-import", step: "r2-upload" },
        extra: { organizationId, entityId }
      })
      throw new ExternalImageError("uploadFailed")
    }

    const asset = await prisma.$transaction(async tx => {
      const mediaAsset = await tx.mediaAsset.upsert({
        where: { storageKey },
        create: {
          organizationId,
          storageKey,
          type: MediaAssetType.IMAGE,
          scope: MediaAssetScope.MENU_ITEM_IMAGE,
          contentType,
          width: metadata.width,
          height: metadata.height,
          bytes: buffer.byteLength
        },
        update: {
          contentType,
          width: metadata.width,
          height: metadata.height,
          bytes: buffer.byteLength,
          deletedAt: null,
          unattachedAt: null,
          updatedAt: new Date()
        }
      })

      await tx.mediaUsage.upsert({
        where: {
          assetId_entityType_entityId_field: {
            assetId: mediaAsset.id,
            entityType: MediaUsageEntityType.MENU_ITEM,
            entityId,
            field: "image"
          }
        },
        create: {
          assetId: mediaAsset.id,
          entityType: MediaUsageEntityType.MENU_ITEM,
          entityId,
          field: "image"
        },
        update: { updatedAt: new Date() }
      })

      return mediaAsset
    })

    return {
      ok: true,
      assetId: asset.id,
      publicUrl: getCacheBustedImageUrl(storageKey, asset.updatedAt)
    }
  } catch (error) {
    if (error instanceof ExternalImageError) {
      return { ok: false, code: error.code }
    }

    Sentry.captureException(error, {
      tags: { section: "external-image-import", step: "unknown" },
      extra: { organizationId, entityId }
    })
    return { ok: false, code: "fetchFailed" }
  }
}
