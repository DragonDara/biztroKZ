"use server"

import * as Sentry from "@sentry/nextjs"
import { getTranslations } from "next-intl/server"
import { cacheTag, updateTag } from "next/cache"
import { z } from "zod/v4"

import { isProMember } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import {
  SUPPORTED_LOCALE_CODES,
  SUPPORTED_LOCALES,
  type SupportedLocaleCode
} from "@/lib/types/translations"
import { isCloudflareWorkersAiConfigured } from "@/lib/ai/cloudflare-workers-ai"
import {
  translateMenuPayload,
  translateSingleItemPayload
} from "@/lib/ai/menu-translator"

const translateMenuItemsInputSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES)
})

const translateMenuItemForLocaleInputSchema = z.object({
  itemId: z.string(),
  locale: z.enum(SUPPORTED_LOCALE_CODES)
})

/**
 * Bulk-translate all active menu items for the current organization into the
 * specified locale using Cloudflare Workers AI.
 */
export const translateMenuItems = authMemberActionClient
  .inputSchema(translateMenuItemsInputSchema)
  .action(async ({ parsedInput: { locale }, ctx: { member } }) => {
    const t = await getTranslations("errors.actions")
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
      return {
        failure: { reason: t("noCurrentOrg") }
      }
    }

    const proMember = await isProMember()
    if (!proMember) {
      return {
        failure: {
          reason: t("translationProOnly")
        }
      }
    }

    if (!isCloudflareWorkersAiConfigured()) {
      return { failure: { reason: t("translationCloudflareRequired") } }
    }

    // Load all active items with variants
    const items = await prisma.menuItem.findMany({
      where: { organizationId: currentOrgId, status: "ACTIVE" },
      include: { variants: true }
    })

    // Load all categories for this organization
    const categories = await prisma.category.findMany({
      where: { organizationId: currentOrgId }
    })

    if (items.length === 0) {
      return {
        failure: {
          reason: t("noActiveProducts")
        }
      }
    }

    const localeName =
      SUPPORTED_LOCALES.find(l => l.code === locale)?.label ?? locale

    const itemsPayload = items.map(item => ({
      menuItemId: item.id,
      name: item.name,
      description: item.description ?? undefined,
      variants: item.variants.map(v => ({
        variantId: v.id,
        name: v.name,
        description: v.description ?? undefined
      }))
    }))

    const categoriesPayload = categories.map(cat => ({
      categoryId: cat.id,
      name: cat.name
    }))

    try {
      const output = await translateMenuPayload({
        locale,
        localeName,
        items: itemsPayload,
        categories: categoriesPayload
      })

      // Upsert translations in the database — run all upserts in parallel
      // batches within a single transaction to reduce sequential round-trips.
      await prisma.$transaction(async tx => {
        const itemUpserts = output.items.map(translatedItem =>
          tx.menuItemTranslation.upsert({
            where: {
              menuItemId_locale: {
                menuItemId: translatedItem.menuItemId,
                locale
              }
            },
            update: {
              name: translatedItem.name,
              description: translatedItem.description ?? null
            },
            create: {
              menuItemId: translatedItem.menuItemId,
              locale,
              name: translatedItem.name,
              description: translatedItem.description ?? null
            }
          })
        )

        const variantUpserts = output.items.flatMap(translatedItem =>
          translatedItem.variants.map(translatedVariant =>
            tx.variantTranslation.upsert({
              where: {
                variantId_locale: {
                  variantId: translatedVariant.variantId,
                  locale
                }
              },
              update: {
                name: translatedVariant.name,
                description: translatedVariant.description ?? null
              },
              create: {
                variantId: translatedVariant.variantId,
                locale,
                name: translatedVariant.name,
                description: translatedVariant.description ?? null
              }
            })
          )
        )

        const categoryUpserts = output.categories.map(
          translatedCategory =>
            tx.categoryTranslation.upsert({
              where: {
                categoryId_locale: {
                  categoryId: translatedCategory.categoryId,
                  locale
                }
              },
              update: { name: translatedCategory.name },
              create: {
                categoryId: translatedCategory.categoryId,
                locale,
                name: translatedCategory.name
              }
            })
        )

        await Promise.all([
          ...itemUpserts,
          ...variantUpserts,
          ...categoryUpserts
        ])
      })

      updateTag(`translations-${currentOrgId}`)

      return {
        success: {
          locale,
          count: output.items.length
        }
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "menu-translate", provider: "cloudflare" }
      })
      return {
        failure: {
          reason: t("translationIncomplete")
        }
      }
    }
  })

/**
 * Translate only the missing translations for a single menu item in a specific
 * locale, including any missing variant translations for that item.
 */
export const translateMenuItemForLocale = authMemberActionClient
  .inputSchema(translateMenuItemForLocaleInputSchema)
  .action(async ({ parsedInput: { itemId, locale }, ctx: { member } }) => {
    const t = await getTranslations("errors.actions")
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
      return {
        failure: { reason: t("noCurrentOrg") }
      }
    }

    const proMember = await isProMember()
    if (!proMember) {
      return {
        failure: {
          reason: t("productTranslationProOnly")
        }
      }
    }

    if (!isCloudflareWorkersAiConfigured()) {
      return { failure: { reason: t("translationCloudflareRequired") } }
    }

    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        organizationId: currentOrgId
      },
      include: {
        translations: {
          where: { locale }
        },
        variants: {
          include: {
            translations: {
              where: { locale }
            }
          }
        }
      }
    })

    if (!item) {
      return {
        failure: { reason: t("productNotFoundForTranslate") }
      }
    }

    const itemNeedsTranslation = item.translations.length === 0
    const variantsMissingTranslation = item.variants.filter(
      variant => variant.translations.length === 0
    )

    if (!itemNeedsTranslation && variantsMissingTranslation.length === 0) {
      return {
        failure: {
          reason: t("productAlreadyTranslated")
        }
      }
    }

    const localeName =
      SUPPORTED_LOCALES.find(entry => entry.code === locale)?.label ?? locale

    const itemPayload = itemNeedsTranslation
      ? {
          menuItemId: item.id,
          name: item.name,
          description: item.description ?? undefined
        }
      : null

    const variantsPayload = variantsMissingTranslation.map(variant => ({
      variantId: variant.id,
      name: variant.name,
      description: variant.description ?? undefined
    }))

    try {
      const output = await translateSingleItemPayload({
        locale,
        localeName,
        item: itemPayload,
        variants: variantsPayload
      })

      let createdItemTranslation: {
        locale: SupportedLocaleCode
        name: string
        description: string | null
      } | null = null
      const createdVariantTranslations: Array<{
        variantId: string
        locale: SupportedLocaleCode
        name: string
        description: string | null
      }> = []

      const outputVariantsById = new Map(
        output.variants.map(variant => [variant.variantId, variant])
      )

      await prisma.$transaction(async tx => {
        if (itemPayload && output.item) {
          const upserted = await tx.menuItemTranslation.upsert({
            where: {
              menuItemId_locale: {
                menuItemId: item.id,
                locale
              }
            },
            create: {
              menuItemId: item.id,
              locale,
              name: output.item.name,
              description: output.item.description?.trim()
                ? output.item.description
                : null
            },
            update: {
              name: output.item.name,
              description: output.item.description?.trim()
                ? output.item.description
                : null
            }
          })

          createdItemTranslation = {
            locale: upserted.locale as SupportedLocaleCode,
            name: upserted.name,
            description: upserted.description
          }
        }

        for (const variant of variantsMissingTranslation) {
          const translatedVariant = outputVariantsById.get(variant.id)

          if (!translatedVariant) {
            continue
          }

          const upserted = await tx.variantTranslation.upsert({
            where: {
              variantId_locale: {
                variantId: variant.id,
                locale
              }
            },
            create: {
              variantId: variant.id,
              locale,
              name: translatedVariant.name,
              description: translatedVariant.description?.trim()
                ? translatedVariant.description
                : null
            },
            update: {
              name: translatedVariant.name,
              description: translatedVariant.description?.trim()
                ? translatedVariant.description
                : null
            }
          })

          createdVariantTranslations.push({
            variantId: upserted.variantId,
            locale: upserted.locale as SupportedLocaleCode,
            name: upserted.name,
            description: upserted.description
          })
        }
      })

      if (!createdItemTranslation && createdVariantTranslations.length === 0) {
        return {
          failure: {
            reason: t("productNoNewTranslations")
          }
        }
      }

      updateTag(`translations-${currentOrgId}`)
      updateTag(`menu-item-${itemId}`)

      return {
        success: {
          locale,
          itemTranslation: createdItemTranslation,
          variantTranslations: createdVariantTranslations
        }
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "item-translate-single" },
        extra: { itemId, locale }
      })

      return {
        failure: {
          reason: t("productTranslationIncomplete")
        }
      }
    }
  })

const deleteMenuTranslationInputSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES)
})

const supportedLocaleCodeSet = new Set<string>(SUPPORTED_LOCALE_CODES)

/**
 * Delete all translations for a given locale for the current organization.
 */
export const deleteMenuTranslation = authMemberActionClient
  .inputSchema(deleteMenuTranslationInputSchema)
  .action(async ({ parsedInput: { locale }, ctx: { member } }) => {
    const t = await getTranslations("errors.actions")
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
      return {
        failure: { reason: t("noCurrentOrg") }
      }
    }

    try {
      // Delete all translation types explicitly: variant translations relate to
      // Variant (not MenuItemTranslation), so they are NOT cascade-deleted when
      // menu item translations are removed and must be deleted here directly.
      const orgItems = await prisma.menuItem.findMany({
        where: { organizationId: currentOrgId },
        select: { id: true, variants: { select: { id: true } } }
      })

      const orgCategories = await prisma.category.findMany({
        where: { organizationId: currentOrgId },
        select: { id: true }
      })

      const variantIds = orgItems.flatMap(item => item.variants.map(v => v.id))
      const itemIds = orgItems.map(item => item.id)
      const categoryIds = orgCategories.map(cat => cat.id)

      await prisma.$transaction([
        prisma.variantTranslation.deleteMany({
          where: { variantId: { in: variantIds }, locale }
        }),
        prisma.menuItemTranslation.deleteMany({
          where: { menuItemId: { in: itemIds }, locale }
        }),
        prisma.categoryTranslation.deleteMany({
          where: { categoryId: { in: categoryIds }, locale }
        })
      ])

      updateTag(`translations-${currentOrgId}`)

      return { success: true }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "menu-translate-delete" }
      })
      return {
        failure: { reason: t("translationDeleteFailed") }
      }
    }
  })

/**
 * Get the list of locales that have at least one translation for the current organization.
 */
export async function getAvailableTranslations(organizationId: string) {
  "use cache"

  cacheTag(`translations-${organizationId}`)

  const rows = await prisma.menuItemTranslation.groupBy({
    by: ["locale"],
    where: {
      menuItem: { organizationId }
    },
    _count: { locale: true }
  })

  const isSupportedLocaleCode = (
    locale: string
  ): locale is SupportedLocaleCode => supportedLocaleCodeSet.has(locale)

  return rows
    .filter((row): row is typeof row & { locale: SupportedLocaleCode } =>
      isSupportedLocaleCode(row.locale)
    )
    .map(row => ({
      locale: row.locale,
      count: row._count.locale
    }))
}

/**
 * Get translations for all active menu items in a specific locale.
 * Used by the public menu page.
 */
export async function getMenuTranslationsByLocale(
  organizationId: string,
  locale: string
) {
  "use cache"

  cacheTag(`translations-${organizationId}`)

  const translations = await prisma.menuItemTranslation.findMany({
    where: {
      locale,
      menuItem: { organizationId, status: "ACTIVE" }
    }
  })

  const variantTranslations = await prisma.variantTranslation.findMany({
    where: {
      locale,
      variant: { menuItem: { organizationId, status: "ACTIVE" } }
    }
  })

  const categoryTranslations = await prisma.categoryTranslation.findMany({
    where: {
      locale,
      category: { organizationId }
    }
  })

  return {
    items: Object.fromEntries(
      translations.map(t => [
        t.menuItemId,
        { name: t.name, description: t.description }
      ])
    ),
    variants: Object.fromEntries(
      variantTranslations.map(t => [
        t.variantId,
        { name: t.name, description: t.description }
      ])
    ),
    categories: Object.fromEntries(
      categoryTranslations.map(t => [t.categoryId, { name: t.name }])
    )
  }
}
