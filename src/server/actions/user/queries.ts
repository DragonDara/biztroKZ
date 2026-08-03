"use server"

// removed unstable_cache usage — functions now fetch directly
import * as Sentry from "@sentry/nextjs"
import { cacheLife, cacheTag } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { SubscriptionStatus } from "@/lib/types/billing"
import { getCacheBustedImageUrl } from "@/lib/utils"

// Get current organization for the user
export async function getCurrentOrganization() {
  "use cache: private"
  cacheLife({ stale: 60 })

  try {
    const currentOrg = await auth.api.getFullOrganization({
      headers: await headers()
    })

    if (!currentOrg) {
      return null
    }
    cacheTag(`organization-${currentOrg.id}`)

    // updatedAt is now available from better-auth API response
    const updatedAt = currentOrg.updatedAt
      ? new Date(currentOrg.updatedAt)
      : new Date()

    if (currentOrg?.banner) {
      currentOrg.banner = getCacheBustedImageUrl(currentOrg.banner, updatedAt)
    }

    if (currentOrg?.logo) {
      currentOrg.logo = getCacheBustedImageUrl(currentOrg.logo, updatedAt)
    }

    return currentOrg
  } catch (err) {
    console.error("Failed to get current organization", err)
    Sentry.captureException(err, {
      tags: { section: "user-queries" }
    })
    return null
  }
}

export async function getActiveOrganization(userId: string) {
  const member = await prisma.member.findFirst({
    where: {
      userId
    },
    include: {
      organization: true
    }
  })

  return member?.organization
}

export async function hasOrganizations(): Promise<number> {
  "use cache: private"
  cacheTag("organizations-list")
  cacheLife({ stale: 60 })

  try {
    const data = await auth.api.listOrganizations({
      headers: await headers()
    })
    if (!Array.isArray(data)) return 0
    return data.length
  } catch (err) {
    console.error("Failed to list organizations", err)
    Sentry.captureException(err, {
      tags: { section: "user-queries" }
    })
    return 0
  }
}

export const getMembers = async (organizationId: string) => {
  "use cache: private"
  cacheTag(`organization-${organizationId}-members`)
  cacheLife({ stale: 60 })

  if (!organizationId) {
    return []
  }

  // Direct fetch without Next.js unstable cache wrapper
  try {
    const members = await auth.api.listMembers({
      query: { organizationId },
      headers: await headers()
    })
    return members
  } catch (err) {
    console.error("Failed to list members", err)
    Sentry.captureException(err, {
      tags: { section: "user-queries" }
    })
    return []
  }
}

export const getCurrentMembership = async () => {
  "use cache: private"
  cacheLife({ stale: 60 })

  try {
    const member = await auth.api.getActiveMember({
      headers: await headers()
    })

    if (member?.id) {
      cacheTag(`membership-${member.id}`)
    }
    cacheTag("membership-current")

    return member
  } catch (err) {
    console.error("Failed to get current membership", err)
    Sentry.captureException(err, {
      tags: { section: "user-queries" }
    })
    return null
  }
}

export const getCurrentMembershipRole = async () => {
  "use cache: private"
  cacheLife({ stale: 60 })

  try {
    const requestHeaders = await headers()
    const { role } = await auth.api.getActiveMemberRole({
      headers: requestHeaders
    })

    cacheTag("membership-current-role")

    return role
  } catch (err) {
    console.error("Failed to get current membership role", err)
    Sentry.captureException(err, {
      tags: { section: "user-queries" }
    })
    return null
  }
}

export const getInviteByToken = async (token: string) => {
  "use cache: private"
  cacheTag(`invitation-${token}`)
  cacheLife({ stale: 60 })

  try {
    const data = await auth.api.getInvitation({
      query: { id: token },
      headers: await headers()
    })

    return {
      data,
      error: null
    }
  } catch (err) {
    console.error("Failed to get invitation by token", err)
    Sentry.captureException(err, {
      tags: { section: "user-queries" },
      extra: { token }
    })
    // If err has a message property, return it; otherwise stringify
    if (err && typeof err === "object" && "message" in err) {
      return {
        data: null,
        error: (err as Error).message
      }
    }

    try {
      return {
        data: null,
        error: String(err)
      }
    } catch {
      return {
        data: null,
        error: "An unknown error occurred"
      }
    }
  }
}

export async function isProMember() {
  "use cache: private"
  cacheLife({ stale: 60 })

  try {
    const org = await getCurrentOrganization()

    if (!org) {
      return false
    }

    cacheTag(`organization-${org.id}-subscription`)

    const subscriptions = await auth.api.listActiveSubscriptions({
      query: { referenceId: org?.id },
      headers: await headers()
    })

    const activeSubscription = subscriptions.find(
      sub => sub.status === "active" || sub.status === "trialing"
    )

    // Update the plan in the organization record if it differs from the subscription plan, if the status is sponsored,
    // it means the organization is on a sponsored PRO plan
    if (
      org &&
      activeSubscription &&
      org.plan?.toUpperCase() !== activeSubscription.plan?.toUpperCase() &&
      org.status !== SubscriptionStatus.SPONSORED
    ) {
      try {
        await auth.api.updateOrganization({
          body: {
            data: {
              plan: activeSubscription.plan.toUpperCase(),
              status: activeSubscription.status.toUpperCase()
            },
            organizationId: org.id
          },
          headers: await headers()
        })
      } catch (error) {
        console.error("Failed to update organization plan", error)
        Sentry.captureException(error, {
          tags: { section: "user-queries" },
          extra: { organizationId: org.id, plan: activeSubscription.plan }
        })
      }
    }

    return (
      activeSubscription?.plan.toUpperCase() === "PRO" ||
      org?.status === SubscriptionStatus.SPONSORED
    )
  } catch (err) {
    console.error("Failed to check if user is pro member", err)
    Sentry.captureException(err, {
      tags: { section: "user-queries" }
    })
    return false
  }
}

function isTransientPermissionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false

  const e = err as {
    code?: string | number
    message?: string
    cause?: { code?: string | number; message?: string }
    body?: { message?: string }
  }

  const message = [e.message, e.cause?.message, e.body?.message]
    .filter(Boolean)
    .join(" ")

  if (/aborted/i.test(message)) return true
  if (e.code === 20 || e.cause?.code === 20) return true

  return false
}

async function getPermissionCached(permissions: Record<string, string[]>) {
  "use cache: private"
  cacheLife({ stale: 30 })

  const requestHeaders = await headers()

  const normalized = Object.entries(permissions)
    .map(([resource, actions]) => {
      const sorted = [...actions].sort()
      return `${resource}:${sorted.join("|")}`
    })
    .sort()
    .join(";")

  cacheTag("permissions-all")
  cacheTag(normalized ? `permissions-${normalized}` : "permissions-default")

  // без try/catch — ошибки уходят во внешнюю обёртку
  return await auth.api.hasPermission({
    headers: requestHeaders,
    body: { permissions }
  })
}

export async function safeHasPermission(permissions: Record<string, string[]>) {
  if (!permissions || Object.keys(permissions).length === 0) {
    console.error("safeHasPermission called without permissions")
    Sentry.captureMessage("safeHasPermission called without permissions", {
      level: "error",
      tags: { section: "user-queries" }
    })
    return null
  }

  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await getPermissionCached(permissions)
    } catch (err) {
      const canRetry = attempt < maxAttempts && isTransientPermissionError(err)

      if (canRetry) continue

      console.error("auth.api.hasPermission failed:", err)
      Sentry.captureException(err, {
        tags: { section: "user-queries" },
        extra: { permissions, attempt }
      })
      return null
    }
  }

  return null
}

export async function isWaitlistEnabled(email?: string | null) {
  const normalizedEmail = email?.trim()?.toLowerCase()

  if (!normalizedEmail) {
    return false
  }

  const waitlist = await prisma.waitlist.findFirst({
    where: {
      email: {
        equals: normalizedEmail
      },
      enabled: true
    }
  })

  return Boolean(waitlist?.enabled)
}
