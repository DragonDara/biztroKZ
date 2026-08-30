"use server"

import { Prisma, type MenuItem } from "@/generated/prisma-client/client"
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import * as Sentry from "@sentry/nextjs"
import { getTranslations } from "next-intl/server"
import { updateTag } from "next/cache"
import { z } from "zod/v4"

import { getItemCount } from "@/server/actions/item/queries"
import {
  fetchAndStoreExternalImage,
  type ExternalImageErrorCode
} from "@/server/actions/media/external-fetch"
import { CACHE_TAGS } from "@/server/actions/media/constants"
import { extractMenuItemsFromFile } from "@/server/actions/menu-import/ai"
import { createImportNameAllocator } from "@/server/actions/menu-import/item-names"
import { executeMenuSyncWithPreference } from "@/server/actions/menu/sync"
import { isProMember } from "@/server/actions/user/queries"
import { appConfig } from "@/app/config"
import type { Currency } from "@/lib/currency"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import { categorySchema } from "@/lib/types/category"
import { BasicPlanLimits } from "@/lib/types/billing"
import {
  categorySchema,
  menuSectionCoverSchema,
  menuSectionSchema
} from "@/lib/types/category"
import { MediaUsageEntityType } from "@/lib/types/media"
import { menuImportFileInputSchema } from "@/lib/types/menu-import"
import {
  bulkMenuItemSchema,
  menuItemSchema,
  MenuItemStatus,
  variantSchema
} from "@/lib/types/menu-item"
import { BasicPlanLimits } from "@/lib/types/plan"
import { getCacheBustedImageUrl } from "@/lib/utils"
import { env } from "@/env.mjs"

export type { MenuImportItem } from "@/lib/types/menu-import"

// Create an Cloudflare R2 service client object
const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_KEY_ID
  }
})

/**
 * Parses a menu file (PDF or image) and extracts structured menu items using AI.
 */
export const parseMenuFile = authMemberActionClient
  .inputSchema(menuImportFileInputSchema)
  .action(async ({ parsedInput }) => {
    const t = await getTranslations("dashboard.menuItems.import.errors")

    if (!parsedInput.simulateResponse && !env.AI_GATEWAY_API_KEY) {
      return {
        failure: {
          reason: t("aiGatewayRequired")
        }
      }
    }

    try {
      const items = await extractMenuItemsFromFile(parsedInput)

      return {
        success: items
      }
    } catch (error) {
      console.error(error)
      Sentry.captureException(error, {
        tags: {
          section: parsedInput.simulateResponse
            ? "menu-import-mock"
            : "menu-import"
        }
      })

      if (parsedInput.simulateResponse) {
        return {
          failure: {
            reason: t("simulateFailed")
          }
        }
      }

      return {
        failure: {
          reason: t("parseFailed")
        }
      }
    }
  })

/**
 * Creates a new item in the menu.
 *
 * @param {menuItemSchema} itemData - The data for the new item.
 * @returns {Promise<{ success: menuItemSchema } | { failure: { reason: string } }>} - A promise that resolves to an object with either a success or failure property.
 */
export const createItem = authMemberActionClient
  .inputSchema(menuItemSchema)
  .action(
    async ({
      parsedInput: {
        name,
        description,
        status,
        image,
        categoryId,
        variants,
        featured,
        allergens,
        currency
      },
      ctx: { member }
    }) => {
      const t = await getTranslations("errors.actions")
      const currentOrgId = member.organizationId

      if (!currentOrgId) {
        return {
          failure: {
            reason: t("noCurrentOrg")
          }
        }
      }

      const proMember = await isProMember()
      const itemCount = await getItemCount()

      const itemLimit = appConfig.itemLimit || 10
      if (!proMember && itemCount >= itemLimit) {
        return {
          failure: {
            reason: t("productLimitReached", { limit: itemLimit }),
            code: BasicPlanLimits.ITEM_LIMIT_REACHED
          }
        }
      }

      // Find if the item already exists
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          name,
          organizationId: currentOrgId
        }
      })

      // If the item already exists, generate a new name for it assigning a unique suffix
      if (existingItem) {
        let suffix = 1
        let candidateName = `${name} (${t("copySuffix")})`

        // Check if the name with "copia" suffix already exists
        let nameExists = await prisma.menuItem.findFirst({
          where: {
            name: candidateName,
            organizationId: currentOrgId
          }
        })

        // If it exists, try incrementing numbers until we find an available name
        while (nameExists) {
          suffix++
          candidateName = `${name} (${t("copySuffixNumbered", { n: suffix })})`
          nameExists = await prisma.menuItem.findFirst({
            where: {
              name: candidateName,
              organizationId: currentOrgId
            }
          })
        }

        name = candidateName
      }

      try {
        // Resolve default currency from the organization's default location if not provided
        const defaultLocation = await prisma.location.findFirst({
          where: { organizationId: currentOrgId }
        })
        const itemCurrency =
          currency ?? (defaultLocation?.currency as Currency) ?? "KZT"
        const item = await prisma.menuItem.create({
          data: {
            name,
            description,
            status,
            image,
            categoryId: categoryId === "" ? null : categoryId,
            featured,
            allergens,
            currency: itemCurrency,
            organizationId: currentOrgId,
            variants: {
              create: [
                {
                  name: variants[0].name,
                  price: variants[0].price
                }
              ]
            }
          }
        })

        updateTag(`menu-items-${currentOrgId}`)
        return { success: item }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
            message = "Ya existe un producto con ese nombre"
          } else {
            message = error.message
          }
        } else if (error instanceof Error) {
          message = error.message
        }
        return {
          failure: {
            reason: message
          }
        }
      }
    }
  )

type GroupedImportItem = {
  name: string
  description?: string
  status?: string
  category?: string
  currency?: Currency
  image?: string
  externalId?: string
  variants: { name: string; price: number }[]
}

export type FailedImportRow = {
  name: string
  variantName?: string
  description?: string
  price: number
  category?: string
  currency?: "MXN" | "USD" | "KZT"
  image?: string
  externalId?: string
  reason: string
}

const IMAGE_REASON_KEY = {
  invalidUrl: "imageInvalidUrl",
  blockedHost: "imageBlockedHost",
  fetchFailed: "imageFetchFailed",
  notImage: "imageNotImage",
  tooLarge: "imageTooLarge",
  corruptImage: "imageCorruptImage",
  uploadFailed: "imageUploadFailed"
} as const satisfies Record<ExternalImageErrorCode, string>

/** Emit one failed CSV row per variant so the download round-trips back into an import. */
function pushFailedRows(
  target: FailedImportRow[],
  item: GroupedImportItem,
  reason: string
) {
  for (const variant of item.variants) {
    target.push({
      name: item.name,
      variantName: variant.name,
      description: item.description,
      price: variant.price,
      category: item.category,
      currency: item.currency as FailedImportRow["currency"],
      image: item.image,
      externalId: item.externalId,
      reason
    })
  }
}

/**
 * Creates multiple items in bulk.
 */
export const bulkCreateItems = authMemberActionClient
  .inputSchema(bulkMenuItemSchema)
  .action(async ({ parsedInput: items, ctx: { member } }) => {
    const t = await getTranslations("dashboard.menuItems.import.errors")
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
      return {
        failure: {
          reason: t("noOrg")
        }
      }
    }

    const groupedItemsMap = new Map<string, GroupedImportItem>()

    for (const item of items) {
      const normalizedName = item.name.trim()
      if (!normalizedName) continue

      const externalId = item.externalId?.trim() || undefined
      const itemKey = externalId
        ? `ext:${externalId.toLowerCase()}`
        : `name:${normalizedName.toLowerCase()}`
      const existingItem = groupedItemsMap.get(itemKey)

      const nextVariantBaseName =
        item.variantName?.trim() ||
        (existingItem
          ? `Variante ${existingItem.variants.length + 1}`
          : "Regular")

      if (!existingItem) {
        groupedItemsMap.set(itemKey, {
          name: normalizedName,
          description: item.description?.trim() || undefined,
          status: item.status,
          category: item.category?.trim() || undefined,
          currency: item.currency,
          image: item.image?.trim() || undefined,
          externalId,
          variants: [{ name: nextVariantBaseName, price: item.price }]
        })
        continue
      }

      const nextVariantName = existingItem.variants.some(
        variant =>
          variant.name.toLowerCase() === nextVariantBaseName.toLowerCase()
      )
        ? `${nextVariantBaseName} ${existingItem.variants.length + 1}`
        : nextVariantBaseName

      existingItem.variants.push({ name: nextVariantName, price: item.price })

      if (!existingItem.description && item.description?.trim()) {
        existingItem.description = item.description.trim()
      }

      if (!existingItem.category && item.category?.trim()) {
        existingItem.category = item.category.trim()
      }

      if (!existingItem.currency && item.currency) {
        existingItem.currency = item.currency
      }

      if (!existingItem.status && item.status) {
        existingItem.status = item.status
      }

      if (!existingItem.image && item.image?.trim()) {
        existingItem.image = item.image.trim()
      }
    }

    const groupedItems = Array.from(groupedItemsMap.values())
    const proMember = await isProMember()

    // Resolve which grouped items already exist (upsert by externalId).
    const externalIds = groupedItems
      .map(item => item.externalId)
      .filter((value): value is string => Boolean(value))
    const existingByExternalId = new Map<string, string>()
    if (externalIds.length > 0) {
      const matched = await prisma.menuItem.findMany({
        where: {
          organizationId: currentOrgId,
          externalId: { in: externalIds }
        },
        select: { id: true, externalId: true }
      })
      for (const match of matched) {
        if (match.externalId)
          existingByExternalId.set(match.externalId, match.id)
      }
    }

    const netNewCount = groupedItems.filter(
      item => !(item.externalId && existingByExternalId.has(item.externalId))
    ).length

    const itemCount = await getItemCount()
    const itemLimit = appConfig.itemLimit || 10
    if (!proMember && itemCount + netNewCount > itemLimit) {
      return {
        failure: {
          reason: t("limitExceeded"),
          code: BasicPlanLimits.ITEM_LIMIT_REACHED
        }
      }
    }

    // Free-tier media budget: how many new images we may store this import.
    let mediaBudget = Number.POSITIVE_INFINITY
    if (!proMember) {
      const assetCount = await prisma.mediaAsset.count({
        where: { organizationId: currentOrgId, deletedAt: null }
      })
      mediaBudget = Math.max(0, appConfig.mediaLimit - assetCount)
    }

    try {
      const defaultLocation = await prisma.location.findFirst({
        where: { organizationId: currentOrgId }
      })
      const defaultCurrency =
        (defaultLocation?.currency as Currency) ?? ("KZT" as Currency)

      // Ensure all referenced categories exist, then build a name -> id map.
      const categoryNames = new Set<string>()
      for (const item of groupedItems) {
        if (item.category) categoryNames.add(item.category.trim())
      }
      const existingCategories = await prisma.category.findMany({
        where: { organizationId: currentOrgId }
      })
      const categoryMap = new Map(
        existingCategories.map(cat => [cat.name.toLowerCase(), cat.id])
      )
      const newCategoryNames = Array.from(categoryNames).filter(
        name => !categoryMap.has(name.toLowerCase())
      )
      if (newCategoryNames.length > 0) {
        await prisma.category.createMany({
          data: newCategoryNames.map(name => ({
            name,
            organizationId: currentOrgId
          }))
        })
        const refreshedCategories = await prisma.category.findMany({
          where: { organizationId: currentOrgId }
        })
        categoryMap.clear()
        for (const cat of refreshedCategories) {
          categoryMap.set(cat.name.toLowerCase(), cat.id)
        }
      }

      const existingItemNames = await prisma.menuItem.findMany({
        where: { organizationId: currentOrgId },
        select: { name: true }
      })
      const allocateItemName = createImportNameAllocator(
        existingItemNames.map(item => item.name)
      )

      const createdItems: MenuItem[] = []
      const failedItems: FailedImportRow[] = []

      // Sequential: each image row triggers an external fetch before its DB write.
      for (const item of groupedItems) {
        const categoryId = item.category
          ? categoryMap.get(item.category.toLowerCase())
          : undefined
        const currency = item.currency
          ? (item.currency as Currency)
          : defaultCurrency
        const existingId = item.externalId
          ? existingByExternalId.get(item.externalId)
          : undefined
        const itemId = existingId ?? crypto.randomUUID()

        let imageAssetId: string | undefined
        let imageStorageKey: string | undefined

        if (item.image) {
          if (mediaBudget <= 0) {
            pushFailedRows(failedItems, item, t("imageMediaLimit"))
            continue
          }

          const result = await fetchAndStoreExternalImage({
            organizationId: currentOrgId,
            entityId: itemId,
            sourceUrl: item.image
          })

          if (!result.ok) {
            pushFailedRows(failedItems, item, t(IMAGE_REASON_KEY[result.code]))
            continue
          }

          imageAssetId = result.assetId
          imageStorageKey = result.storageKey
          mediaBudget -= 1
        }

        try {
          if (existingId) {
            const updated = await prisma.menuItem.update({
              where: { id: existingId },
              data: {
                name: item.name,
                description: item.description || "",
                status: item.status || MenuItemStatus.ACTIVE,
                categoryId: categoryId ?? null,
                currency,
                ...(imageAssetId && imageStorageKey
                  ? { imageAssetId, image: imageStorageKey }
                  : {}),
                variants: {
                  deleteMany: {},
                  create: item.variants.map(variant => ({
                    name: variant.name,
                    price: variant.price
                  }))
                }
              }
            })
            createdItems.push(updated)
          } else {
            const created = await prisma.menuItem.create({
              data: {
                id: itemId,
                name: allocateItemName(item.name),
                externalId: item.externalId,
                description: item.description || "",
                status: item.status || MenuItemStatus.ACTIVE,
                categoryId,
                currency,
                organizationId: currentOrgId,
                ...(imageAssetId && imageStorageKey
                  ? { imageAssetId, image: imageStorageKey }
                  : {}),
                variants: {
                  create: item.variants.map(variant => ({
                    name: variant.name,
                    price: variant.price
                  }))
                }
              }
            })
            createdItems.push(created)
          }
        } catch (error) {
          Sentry.captureException(error, {
            tags: { section: "item-mutations", operation: "bulkCreateItems" },
            extra: { organizationId: currentOrgId, externalId: item.externalId }
          })
          pushFailedRows(failedItems, item, t("bulkSaveRetry"))
        }
      }

      updateTag(`menu-items-${currentOrgId}`)
      updateTag(`categories-${currentOrgId}`)
      return { success: createdItems, failedItems }
    } catch (error) {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "item-mutations", operation: "bulkCreateItems" },
        extra: { organizationId: currentOrgId, itemCount: groupedItems.length }
      })

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            return { failure: { reason: t("duplicateEntry") } }
          case "P2003":
            return { failure: { reason: t("invalidReference") } }
          default:
            return {
              failure: {
                reason: t("duplicateCheck", { code: error.code })
              }
            }
        }
      }

      return {
        failure: {
          reason: t("bulkSaveRetry")
        }
      }
    }
  })

export const exportMenuItems = authMemberActionClient.action(
  async ({ ctx: { member } }) => {
    const t = await getTranslations("errors.actions")
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
      return {
        failure: {
          reason: t("noCurrentOrg")
        }
      }
    }

    try {
      const items = await prisma.menuItem.findMany({
        where: {
          organizationId: currentOrgId
        },
        include: {
          category: true,
          variants: {
            orderBy: {
              price: "asc"
            }
          }
        },
        orderBy: {
          name: "asc"
        }
      })

      return { success: items }
    } catch (error) {
      console.error("Error exporting items:", error)
      Sentry.captureException(error, {
        tags: { section: "item-mutations" },
        extra: { organizationId: currentOrgId }
      })
      return {
        failure: {
          reason: error instanceof Error ? error.message : t("exportItemsError")
        }
      }
    }
  }
)

/**
 * Updates an item.
 *
 * @param id - The ID of the item to update.
 * @param name - The new name of the item.
 * @param description - The new description of the item.
 * @param status - The new status of the item.
 * @param categoryId - The new category ID of the item.
 * @param organizationId - The ID of the organization the item belongs to.
 * @param variants - An array of variants to update or create.
 * @returns An object with the updated item on success, or a failure object with a reason on failure.
 */
export const updateItem = authMemberActionClient
  .inputSchema(menuItemSchema)
  .action(
    async ({
      parsedInput: {
        id,
        name,
        description,
        status,
        categoryId,
        organizationId,
        variants,
        featured,
        allergens,
        currency,
        translations,
        updatePublishedMenus,
        rememberPublishedChoice
      }
    }) => {
      try {
        const item = await prisma.menuItem.update({
          where: { id },
          data: {
            name,
            description,
            status,
            currency: currency ?? "KZT",
            categoryId: categoryId === "" ? null : categoryId,
            featured,
            allergens,
            variants: {
              upsert: variants.map(variant => ({
                where: { id: variant.id },
                create: {
                  name: variant.name,
                  price: variant.price,
                  translations: variant.translations
                    ? {
                        create: variant.translations.map(translation => ({
                          locale: translation.locale,
                          name: translation.name,
                          description: translation.description?.trim()
                            ? translation.description
                            : null
                        }))
                      }
                    : undefined
                },
                update: {
                  name: variant.name,
                  price: variant.price,
                  translations: variant.translations
                    ? {
                        upsert: variant.translations.map(translation => ({
                          where: {
                            variantId_locale: {
                              variantId: variant.id!,
                              locale: translation.locale
                            }
                          },
                          create: {
                            locale: translation.locale,
                            name: translation.name,
                            description: translation.description?.trim()
                              ? translation.description
                              : null
                          },
                          update: {
                            name: translation.name,
                            description: translation.description?.trim()
                              ? translation.description
                              : null
                          }
                        }))
                      }
                    : undefined
                }
              }))
            },
            translations: translations
              ? {
                  upsert: translations.map(translation => ({
                    where: {
                      menuItemId_locale: {
                        menuItemId: id!,
                        locale: translation.locale
                      }
                    },
                    create: {
                      locale: translation.locale,
                      name: translation.name,
                      description: translation.description?.trim()
                        ? translation.description
                        : null
                    },
                    update: {
                      name: translation.name,
                      description: translation.description?.trim()
                        ? translation.description
                        : null
                    }
                  }))
                }
              : undefined
          }
        })

        updateTag(`menu-items-${organizationId}`)
        updateTag(`menu-item-${id}`)
        updateTag(`translations-${organizationId}`)

        const sync = await executeMenuSyncWithPreference({
          organizationId: organizationId ?? "",
          updatePublishedMenus,
          rememberPublishedChoice
        })

        return {
          success: {
            item,
            sync
          }
        }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(error)
          Sentry.captureException(error, {
            tags: { section: "item-mutations", operation: "updateItem" },
            extra: { itemId: id, errorCode: error.code }
          })
          if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
            message = "Ya existe un producto con ese nombre"
          } else {
            message = error.message
          }
        } else if (error instanceof Error) {
          message = error.message
        }
        return {
          failure: {
            reason: message
          }
        }
      }
    }
  )

const bulkUpdateItemsSchema = z.object({
  items: z.array(
    menuItemSchema.extend({
      id: z.string(),
      organizationId: z.string()
    })
  ),
  updatePublishedMenus: z.boolean().optional(),
  rememberPublishedChoice: z.boolean().optional()
})

/**
 * Updates multiple items in bulk (best-effort).
 */
export const bulkUpdateItems = authMemberActionClient
  .inputSchema(bulkUpdateItemsSchema)
  .action(
    async ({
      parsedInput: { items, updatePublishedMenus, rememberPublishedChoice },
      ctx: { member }
    }) => {
      const t = await getTranslations("errors.actions")
      const currentOrgId = member.organizationId

      if (!currentOrgId) {
        return {
          failure: {
            reason: t("noCurrentOrg")
          }
        }
      }

      const successIds: string[] = []
      const failed: Array<{ id: string; reason: string }> = []

      try {
        for (const item of items) {
          const itemId = item.id
          try {
            await prisma.menuItem.update({
              where: { id: itemId },
              data: {
                name: item.name,
                description: item.description,
                status: item.status,
                currency: item.currency ?? "KZT",
                categoryId: item.categoryId === "" ? null : item.categoryId,
                featured: item.featured,
                allergens: item.allergens,
                variants: {
                  upsert: item.variants.map(variant => ({
                    where: { id: variant.id },
                    create: {
                      name: variant.name,
                      price: variant.price
                    },
                    update: {
                      name: variant.name,
                      price: variant.price
                    }
                  }))
                }
              }
            })

            successIds.push(itemId)
          } catch (error) {
            let message = t("unknownError")
            if (typeof error === "string") {
              message = error
            } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (
                error.code === "P2002" ||
                error.code === "SQLITE_CONSTRAINT"
              ) {
                message = "Ya existe un producto con ese nombre"
              } else {
                message = error.message
              }
            } else if (error instanceof Error) {
              message = error.message
            }

            failed.push({ id: itemId, reason: message })
          }
        }

        if (successIds.length > 0) {
          updateTag(`menu-items-${currentOrgId}`)
          for (const id of successIds) {
            updateTag(`menu-item-${id}`)
          }
        }

        const sync =
          successIds.length > 0
            ? await executeMenuSyncWithPreference({
                organizationId: currentOrgId,
                updatePublishedMenus,
                rememberPublishedChoice
              })
            : null

        return {
          success: {
            successIds,
            failed,
            sync
          }
        }
      } catch (error) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "item-mutations" },
          extra: { organizationId: currentOrgId, itemCount: items.length }
        })
        return {
          failure: {
            reason: t("updateProductsError")
          }
        }
      }
    }
  )

/**
 * Deletes an item from the server.
 *
 * @param id - The ID of the item to be deleted.
 * @param organizationId - The ID of the organization the item belongs to.
 * @returns An object indicating the success or failure of the deletion operation.
 */
export const deleteItem = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { id, organizationId } }) => {
    try {
      // Delete the image from the storage if exists
      const item = await prisma.menuItem.findUnique({
        where: { id }
      })

      if (item?.image) {
        // Delete the image from the storage
        await R2.send(
          new DeleteObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: item.image || undefined
          })
        )
      }
      await prisma.menuItem.delete({
        where: { id }
      })

      updateTag(`menu-items-${organizationId}`)
      return { success: true }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "item-mutations", operation: "deleteItem" },
          extra: { itemId: id, organizationId, errorCode: error.code }
        })
        message = error.message
      } else if (error instanceof Error) {
        message = error.message
      }
      return {
        failure: {
          reason: message
        }
      }
    }
  })

/**
 * Creates a new category.
 *
 * @param name - The name of the category.
 * @returns An object with either a success property containing the created category, or a failure property containing the reason for failure.
 */
export const createCategory = authMemberActionClient
  .inputSchema(categorySchema)
  .action(async ({ parsedInput: { name, menuSectionId }, ctx: { member } }) => {
    const t = await getTranslations("errors.actions")
    const currentOrgId = member.organizationId
    if (!currentOrgId) {
      return {
        failure: {
          reason: t("noCurrentOrg")
        }
      }
    }

    try {
      if (menuSectionId) {
        const menuSectionExists = await prisma.menuSection.count({
          where: { id: menuSectionId, organizationId: currentOrgId }
        })
        if (!menuSectionExists) {
          return { failure: { reason: t("unknownError") } }
        }
      }

      const category = await prisma.category.create({
        data: {
          name,
          menuSectionId: menuSectionId || null,
          organizationId: currentOrgId
        }
      })

      updateTag(`categories-${currentOrgId}`)
      updateTag(`menu-sections-${currentOrgId}`)
      return { success: category }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "item-mutations" },
          extra: { categoryName: name, errorCode: error.code }
        })
        if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
          message = "Ya existe una categoría con ese nombre"
        } else {
          message = error.message
        }
      } else if (error instanceof Error) {
        message = error.message
      }
      return {
        failure: {
          reason: message
        }
      }
    }
  })

/**
 * Updates a category.
 *
 * @param id - The ID of the category to update.
 * @param name - The new name for the category.
 * @param organizationId - The ID of the organization the category belongs to.
 * @returns An object with the updated category if successful, or a failure object with a reason if an error occurs.
 */
export const updateCategory = authMemberActionClient
  .inputSchema(categorySchema)
  .action(
    async ({
      parsedInput: {
        id,
        name,
        menuSectionId,
        organizationId,
        updatePublishedMenus,
        rememberPublishedChoice
      },
      ctx: { member }
    }) => {
      const currentOrgId = member.organizationId
      const t = await getTranslations("errors.actions")
      if (!currentOrgId || currentOrgId !== organizationId) {
        return { failure: { reason: t("noCurrentOrg") } }
      }

      try {
        if (!id) {
          return { failure: { reason: t("unknownError") } }
        }
        if (menuSectionId) {
          const menuSectionExists = await prisma.menuSection.count({
            where: { id: menuSectionId, organizationId: currentOrgId }
          })
          if (!menuSectionExists) {
            return { failure: { reason: t("unknownError") } }
          }
        }

        const category = await prisma.category.update({
          where: { id, organizationId: currentOrgId },
          data: {
            name,
            menuSectionId: menuSectionId || null
          }
        })

        updateTag(`categories-${currentOrgId}`)
        updateTag(`menu-sections-${currentOrgId}`)
        updateTag(`menu-items-${currentOrgId}`)

        const sync = await executeMenuSyncWithPreference({
          organizationId: currentOrgId,
          updatePublishedMenus,
          rememberPublishedChoice
        })

        return {
          success: {
            category,
            sync
          }
        }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(error)
          Sentry.captureException(error, {
            tags: { section: "item-mutations", operation: "updateCategory" },
            extra: { categoryId: id, errorCode: error.code }
          })
          if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
            message = "Ya existe una categoría con ese nombre"
          } else {
            message = error.message
          }
        } else if (error instanceof Error) {
          message = error.message
        }
        return {
          failure: {
            reason: message
          }
        }
      }
    }
  )

/**
 * Deletes a category.
 *
 * @param {string} id - The ID of the category to delete.
 * @param {string} organizationId - The ID of the organization the category belongs to.
 * @returns {Promise<{ success: boolean } | { failure: { reason: string } }>} - A promise that resolves to an object indicating the success or failure of the deletion operation.
 */
export const deleteCategory = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { id, organizationId }, ctx: { member } }) => {
    const currentOrgId = member.organizationId
    const t = await getTranslations("errors.actions")
    if (!currentOrgId || currentOrgId !== organizationId) {
      return { failure: { reason: t("noCurrentOrg") } }
    }

    try {
      // Check if the category is being used by any item
      const items = await prisma.menuItem.findMany({
        where: { categoryId: id, organizationId: currentOrgId }
      })

      if (items.length > 0) {
        return {
          failure: {
            reason: t("categoryHasProducts")
          }
        }
      }

      await prisma.category.delete({
        where: { id, organizationId: currentOrgId }
      })

      updateTag(`categories-${currentOrgId}`)
      updateTag(`menu-sections-${currentOrgId}`)
      return { success: true }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "item-mutations", operation: "deleteCategory" },
          extra: { categoryId: id, organizationId, errorCode: error.code }
        })
        message = error.message
      } else if (error instanceof Error) {
        message = error.message
      }
      return {
        failure: {
          reason: message
        }
      }
    }
  })

export const createMenuSection = authMemberActionClient
  .inputSchema(menuSectionSchema)
  .action(async ({ parsedInput: { name }, ctx: { member } }) => {
    const currentOrgId = member.organizationId
    const t = await getTranslations("errors.actions")
    if (!currentOrgId) {
      return { failure: { reason: t("noCurrentOrg") } }
    }

    try {
      const menuSection = await prisma.menuSection.create({
        data: { name, organizationId: currentOrgId }
      })
      updateTag(`menu-sections-${currentOrgId}`)
      return { success: menuSection }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "item-mutations", operation: "createMenuSection" },
        extra: { organizationId: currentOrgId, menuSectionName: name }
      })
      return {
        failure: {
          reason:
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
              ? t("menuSectionExists")
              : error instanceof Error
                ? error.message
                : t("unknownError")
        }
      }
    }
  })

export const updateMenuSection = authMemberActionClient
  .inputSchema(menuSectionSchema)
  .action(
    async ({
      parsedInput: {
        id,
        name,
        organizationId,
        updatePublishedMenus,
        rememberPublishedChoice
      },
      ctx: { member }
    }) => {
      const currentOrgId = member.organizationId
      const t = await getTranslations("errors.actions")
      if (!currentOrgId || currentOrgId !== organizationId) {
        return { failure: { reason: t("noCurrentOrg") } }
      }

      try {
        if (!id) {
          return { failure: { reason: t("unknownError") } }
        }
        const menuSection = await prisma.menuSection.update({
          where: { id, organizationId: currentOrgId },
          data: { name }
        })
        updateTag(`menu-sections-${currentOrgId}`)
        updateTag(`categories-${currentOrgId}`)
        updateTag(`menu-items-${currentOrgId}`)
        const sync = await executeMenuSyncWithPreference({
          organizationId: currentOrgId,
          updatePublishedMenus,
          rememberPublishedChoice
        })
        return { success: { menuSection, sync } }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { section: "item-mutations", operation: "updateMenuSection" },
          extra: { organizationId: currentOrgId, menuSectionId: id }
        })
        return {
          failure: {
            reason:
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === "P2002"
                ? t("menuSectionExists")
                : error instanceof Error
                  ? error.message
                  : t("unknownError")
          }
        }
      }
    }
  )

export const syncMenuSectionCover = authMemberActionClient
  .inputSchema(menuSectionCoverSchema)
  .action(
    async ({
      parsedInput: {
        id,
        organizationId,
        updatePublishedMenus,
        rememberPublishedChoice
      },
      ctx: { member }
    }) => {
      const currentOrgId = member.organizationId
      const t = await getTranslations("errors.actions")
      if (!currentOrgId || currentOrgId !== organizationId) {
        return { failure: { reason: t("noCurrentOrg") } }
      }

      try {
        const storageKey = `orgs/${currentOrgId}/menu-sections/${id}/cover`
        const [existingMenuSection, asset] = await Promise.all([
          prisma.menuSection.findFirst({
            where: { id, organizationId: currentOrgId },
            select: { id: true }
          }),
          prisma.mediaAsset.findFirst({
            where: {
              storageKey,
              organizationId: currentOrgId,
              deletedAt: null
            },
            select: { id: true }
          })
        ])
        if (!existingMenuSection || !asset) {
          return { failure: { reason: t("unknownError") } }
        }

        const menuSection = await prisma.$transaction(async tx => {
          await tx.mediaUsage.upsert({
            where: {
              assetId_entityType_entityId_field: {
                assetId: asset.id,
                entityType: MediaUsageEntityType.MENU_SECTION,
                entityId: id,
                field: "coverImage"
              }
            },
            create: {
              assetId: asset.id,
              entityType: MediaUsageEntityType.MENU_SECTION,
              entityId: id,
              field: "coverImage"
            },
            update: { updatedAt: new Date() }
          })
          await tx.mediaAsset.update({
            where: { id: asset.id },
            data: { unattachedAt: null }
          })
          return tx.menuSection.update({
            where: { id, organizationId: currentOrgId },
            data: { coverImage: storageKey, coverImageAssetId: asset.id },
            select: { coverImage: true, updatedAt: true }
          })
        })

        updateTag(`menu-sections-${currentOrgId}`)
        updateTag(`categories-${currentOrgId}`)
        updateTag(`menu-items-${currentOrgId}`)
        updateTag(CACHE_TAGS.mediaAssets(currentOrgId))
        updateTag(CACHE_TAGS.mediaCount(currentOrgId))
        const sync = await executeMenuSyncWithPreference({
          organizationId: currentOrgId,
          updatePublishedMenus,
          rememberPublishedChoice
        })
        return {
          success: {
            coverImage: menuSection.coverImage
              ? getCacheBustedImageUrl(
                  menuSection.coverImage,
                  menuSection.updatedAt
                )
              : null,
            sync
          }
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            section: "item-mutations",
            operation: "syncMenuSectionCover"
          },
          extra: { organizationId: currentOrgId, menuSectionId: id }
        })
        return {
          failure: {
            reason: error instanceof Error ? error.message : t("unknownError")
          }
        }
      }
    }
  )

export const removeMenuSectionCover = authMemberActionClient
  .inputSchema(menuSectionCoverSchema)
  .action(
    async ({
      parsedInput: {
        id,
        organizationId,
        updatePublishedMenus,
        rememberPublishedChoice
      },
      ctx: { member }
    }) => {
      const currentOrgId = member.organizationId
      const t = await getTranslations("errors.actions")
      if (!currentOrgId || currentOrgId !== organizationId) {
        return { failure: { reason: t("noCurrentOrg") } }
      }

      try {
        const existingMenuSection = await prisma.menuSection.findFirst({
          where: { id, organizationId: currentOrgId },
          select: { coverImageAssetId: true }
        })
        if (!existingMenuSection) {
          return { failure: { reason: t("unknownError") } }
        }

        const menuSection = await prisma.$transaction(async tx => {
          const updatedMenuSection = await tx.menuSection.update({
            where: { id, organizationId: currentOrgId },
            data: { coverImage: null, coverImageAssetId: null }
          })

          if (existingMenuSection.coverImageAssetId) {
            await tx.mediaUsage.deleteMany({
              where: {
                assetId: existingMenuSection.coverImageAssetId,
                entityType: MediaUsageEntityType.MENU_SECTION,
                entityId: id,
                field: "coverImage"
              }
            })
            await tx.mediaAsset.updateMany({
              where: {
                id: existingMenuSection.coverImageAssetId,
                organizationId: currentOrgId
              },
              data: { unattachedAt: new Date() }
            })
          }

          return updatedMenuSection
        })

        updateTag(`menu-sections-${currentOrgId}`)
        updateTag(`categories-${currentOrgId}`)
        updateTag(`menu-items-${currentOrgId}`)
        updateTag(CACHE_TAGS.mediaAssets(currentOrgId))
        updateTag(CACHE_TAGS.mediaCount(currentOrgId))
        const sync = await executeMenuSyncWithPreference({
          organizationId: currentOrgId,
          updatePublishedMenus,
          rememberPublishedChoice
        })
        return { success: { menuSection, sync } }
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            section: "item-mutations",
            operation: "removeMenuSectionCover"
          },
          extra: { organizationId: currentOrgId, menuSectionId: id }
        })
        return {
          failure: {
            reason: error instanceof Error ? error.message : t("unknownError")
          }
        }
      }
    }
  )

export const deleteMenuSection = authMemberActionClient
  .inputSchema(z.object({ id: z.string(), organizationId: z.string() }))
  .action(async ({ parsedInput: { id, organizationId }, ctx: { member } }) => {
    const currentOrgId = member.organizationId
    const t = await getTranslations("errors.actions")
    if (!currentOrgId || currentOrgId !== organizationId) {
      return { failure: { reason: t("noCurrentOrg") } }
    }

    try {
      const menuSection = await prisma.menuSection.findFirst({
        where: { id, organizationId: currentOrgId },
        select: { coverImageAssetId: true }
      })
      if (!menuSection) {
        return { failure: { reason: t("unknownError") } }
      }

      await prisma.$transaction(async tx => {
        await tx.menuSection.delete({
          where: { id, organizationId: currentOrgId }
        })
        if (!menuSection.coverImageAssetId) return

        await tx.mediaUsage.deleteMany({
          where: {
            assetId: menuSection.coverImageAssetId,
            entityType: MediaUsageEntityType.MENU_SECTION,
            entityId: id,
            field: "coverImage"
          }
        })
        await tx.mediaAsset.updateMany({
          where: {
            id: menuSection.coverImageAssetId,
            organizationId: currentOrgId
          },
          data: { unattachedAt: new Date() }
        })
      })
      updateTag(`menu-sections-${currentOrgId}`)
      updateTag(`categories-${currentOrgId}`)
      updateTag(`menu-items-${currentOrgId}`)
      updateTag(CACHE_TAGS.mediaAssets(currentOrgId))
      updateTag(CACHE_TAGS.mediaCount(currentOrgId))
      const sync = await executeMenuSyncWithPreference({
        organizationId: currentOrgId,
        updatePublishedMenus: false
      })
      return { success: { deleted: true, sync } }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "item-mutations", operation: "deleteMenuSection" },
        extra: { organizationId: currentOrgId, menuSectionId: id }
      })
      return {
        failure: {
          reason: error instanceof Error ? error.message : t("unknownError")
        }
      }
    }
  })

/**
 * Creates a variant for a menu item.
 *
 * @param name - The name of the variant.
 * @param price - The price of the variant.
 * @param menuItemId - The ID of the associated menu item.
 * @returns An object with either a success property containing the created variant, or a failure property containing the reason for failure.
 */
export const createVariant = authMemberActionClient
  .inputSchema(variantSchema)
  .action(async ({ parsedInput: { name, price, menuItemId } }) => {
    const t = await getTranslations("errors.actions")
    if (!menuItemId) {
      return {
        failure: {
          reason: t("productNotFound")
        }
      }
    }

    try {
      const variant = await prisma.variant.create({
        data: {
          name,
          price,
          menuItemId
        }
      })

      updateTag(`menu-item-${menuItemId}`)
      return { success: variant }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "item-mutations", operation: "createVariant" },
          extra: { menuItemId, errorCode: error.code }
        })
        message = error.message
      } else if (error instanceof Error) {
        message = error.message
      }
      return {
        failure: {
          reason: message
        }
      }
    }
  })

/**
 * Deletes a variant.
 *
 * @param {string} id - The ID of the variant to delete.
 * @param {string} menuItemId - The ID of the menu item associated with the variant.
 * @returns {Promise<{ success: boolean } | { failure: { reason: string } }>} - A promise that resolves to an object indicating the success or failure of the deletion operation.
 */
export const deleteVariant = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      menuItemId: z.string()
    })
  )
  .action(async ({ parsedInput: { id, menuItemId } }) => {
    try {
      await prisma.variant.delete({
        where: { id }
      })

      updateTag(`menu-item-${menuItemId}`)
      return { success: true }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "item-mutations", operation: "deleteVariant" },
          extra: { variantId: id, menuItemId, errorCode: error.code }
        })
        message = error.message
      } else if (error instanceof Error) {
        message = error.message
      }
      return {
        failure: {
          reason: message
        }
      }
    }
  })

/**
 * Updates the category of multiple items at once.
 */
export const bulkUpdateCategory = authMemberActionClient
  .inputSchema(
    z.object({
      ids: z.array(z.string()),
      categoryId: z.string(),
      organizationId: z.string(),
      updatePublishedMenus: z.boolean().optional(),
      rememberPublishedChoice: z.boolean().optional()
    })
  )
  .action(
    async ({
      parsedInput: {
        ids,
        categoryId,
        organizationId,
        updatePublishedMenus,
        rememberPublishedChoice
      }
    }) => {
      const t = await getTranslations("errors.actions")
      try {
        await prisma.menuItem.updateMany({
          where: {
            id: { in: ids }
          },
          data: {
            categoryId
          }
        })

        updateTag(`menu-items-${organizationId}`)

        const sync = await executeMenuSyncWithPreference({
          organizationId,
          updatePublishedMenus,
          rememberPublishedChoice
        })

        return {
          success: {
            sync
          }
        }
      } catch (error) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "item-mutations", operation: "bulkUpdateCategory" },
          extra: { organizationId, categoryId, itemIds: ids.slice(0, 10) }
        })
        return {
          failure: {
            reason: t("updateCategoriesError")
          }
        }
      }
    }
  )

/**
 * Deletes multiple items at once.
 */
export const bulkDeleteItems = authMemberActionClient
  .inputSchema(
    z.object({
      ids: z.array(z.string()),
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { ids, organizationId } }) => {
    const t = await getTranslations("errors.actions")
    try {
      // First get all items to delete their images
      const items = await prisma.menuItem.findMany({
        where: { id: { in: ids } }
      })

      // Delete images from storage if they exist
      await Promise.all(
        items
          .filter(item => item.image)
          .map(item =>
            R2.send(
              new DeleteObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: item.image || undefined
              })
            )
          )
      )

      // Delete all items
      await prisma.menuItem.deleteMany({
        where: {
          id: { in: ids }
        }
      })

      updateTag(`menu-items-${organizationId}`)
      return { success: true }
    } catch (error) {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "item-mutations" },
        extra: { organizationId, itemIds: ids.slice(0, 10) }
      })
      return {
        failure: {
          reason: t("deleteProductsError")
        }
      }
    }
  })

/**
 * Toggles the featured status of multiple items at once.
 */
export const bulkToggleFeature = authMemberActionClient
  .inputSchema(
    z.object({
      ids: z.array(z.string()),
      featured: z.boolean(),
      organizationId: z.string(),
      updatePublishedMenus: z.boolean().optional(),
      rememberPublishedChoice: z.boolean().optional()
    })
  )
  .action(
    async ({
      parsedInput: {
        ids,
        featured,
        organizationId,
        updatePublishedMenus,
        rememberPublishedChoice
      }
    }) => {
      const t = await getTranslations("errors.actions")
      try {
        await prisma.menuItem.updateMany({
          where: {
            id: { in: ids }
          },
          data: {
            featured
          }
        })

        updateTag(`menu-items-${organizationId}`)

        const sync = await executeMenuSyncWithPreference({
          organizationId,
          updatePublishedMenus,
          rememberPublishedChoice
        })

        return {
          success: {
            sync
          }
        }
      } catch (error) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "item-mutations" },
          extra: { organizationId, featured, itemIds: ids.slice(0, 10) }
        })
        return {
          failure: {
            reason: t("updateFeaturedError")
          }
        }
      }
    }
  )
