import { z } from "zod/v4"

import { SUPPORTED_LOCALE_CODES } from "@/lib/types/translations"

export const variantSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Name is required" : undefined
    })
    .min(3, {
      error: "Name is too short"
    })
    .max(100, {
      error: "Name is too long"
    }),
  description: z.string().optional(),
  price: z.number().min(0, { error: "Price cannot be negative" }),
  menuItemId: z.string().optional(),
  translations: z
    .array(
      z.object({
        locale: z.enum(SUPPORTED_LOCALE_CODES),
        name: z
          .string({
            error: issue =>
              issue.input === undefined ? "Name is required" : undefined
          })
          .min(3, {
            error: "Name is too short"
          })
          .max(100, {
            error: "Name is too long"
          }),
        description: z.string().optional()
      })
    )
    .refine(items => new Set(items.map(t => t.locale)).size === items.length, {
      message: "Duplicate locale in variant translations"
    })
    .optional()
})

export const variantTranslationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Name is required" : undefined
    })
    .min(3, {
      error: "Name is too short"
    })
    .max(100, {
      error: "Name is too long"
    }),
  description: z.string().optional()
})

export const variantFormTranslationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES),
  name: z.string().optional(),
  description: z.string().optional()
})

export const menuItemTranslationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Name is required" : undefined
    })
    .min(3, {
      error: "Name is too short"
    })
    .max(100, {
      error: "Name is too long"
    }),
  description: z.string().optional()
})

export const menuItemFormTranslationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES),
  name: z.string().optional(),
  description: z.string().optional()
})

export const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Name is required" : undefined
    })
    .min(3, {
      error: "Name is too short"
    })
    .max(100, {
      error: "Name is too long"
    }),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  description: z.string().optional(),
  image: z.url().optional(),
  categoryId: z.string().optional(),
  organizationId: z.string().optional(),
  featured: z.boolean().prefault(false).optional(),
  currency: z.enum(["MXN", "USD", "KZT"]).default("KZT").optional(),
  variants: z.tuple([variantSchema], variantSchema),
  allergens: z.string().optional(),
  translations: z
    .array(menuItemTranslationSchema)
    .refine(items => new Set(items.map(t => t.locale)).size === items.length, {
      message: "Duplicate locale in translations"
    })
    .optional(),
  updatePublishedMenus: z.boolean().optional(),
  rememberPublishedChoice: z.boolean().optional()
})

export const menuItemFormSchema = menuItemSchema.extend({
  variants: z.tuple(
    [
      variantSchema.extend({
        translations: z
          .array(variantFormTranslationSchema)
          .refine(
            items => new Set(items.map(t => t.locale)).size === items.length,
            { message: "Duplicate locale in variant translations" }
          )
          .optional()
      })
    ],
    variantSchema.extend({
      translations: z
        .array(variantFormTranslationSchema)
        .refine(
          items => new Set(items.map(t => t.locale)).size === items.length,
          { message: "Duplicate locale in variant translations" }
        )
        .optional()
    })
  ),
  translations: z
    .array(menuItemFormTranslationSchema)
    .refine(items => new Set(items.map(t => t.locale)).size === items.length, {
      message: "Duplicate locale in translations"
    })
    .optional()
})

export type MenuItemQueryFilter = {
  status?: string
  category?: string
  start?: string
  end?: string
  take?: number
}

export const enum MenuItemStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED"
}

export type BulkMenuItem = {
  name: string
  description?: string
  price: number
  variantName?: string
  status?: string
  category?: string
  currency?: "MXN" | "USD" | "KZT"
  image?: string
  externalId?: string
}

export const bulkMenuItemSchema = z.array(
  z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    variantName: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    currency: z.enum(["MXN", "USD", "KZT"]).optional(),
    image: z.url().optional(),
    externalId: z.string().min(1).optional()
  })
)

export const Allergens = [
  { value: "SEAFOOD", label: "Seafood" },
  { value: "PEANUT", label: "Peanut" },
  { value: "LACTOSE", label: "Lactose" },
  { value: "NUT", label: "Nuts" },
  { value: "GLUTEN", label: "Gluten" },
  { value: "FISH", label: "Fish" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "SPICY", label: "Spicy" }
] as const
