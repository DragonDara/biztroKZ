import { z } from "zod/v4"
import { runCloudflareWorkersAi } from "@/lib/ai/cloudflare-workers-ai"
import { ACTIVE_MENU_TRANSLATION_MODEL } from "@/lib/ai/menu-translation-models"
import type { SupportedLocaleCode } from "@/lib/types/translations"
  
  const categoryTranslationSchema = z.object({
    categoryId: z.string().describe("Original category ID"),
    name: z.string().describe("Translated category name")
  })
  
  const translationOutputSchema = z.object({
    items: z.array(
      z.object({
        menuItemId: z.string().describe("Original menu item ID"),
        name: z.string().describe("Translated item name"),
        description: z
          .string()
          .optional()
          .describe("Translated item description"),
        variants: z.array(
          z.object({
            variantId: z.string().describe("Original variant ID"),
            name: z.string().describe("Translated variant name"),
            description: z
              .string()
              .optional()
              .describe("Translated variant description")
          })
        )
      })
    ),
    categories: z.array(categoryTranslationSchema)
  })
  
  const itemTranslationOutputSchema = z.object({
    item: z
      .object({
        menuItemId: z.string().describe("Original menu item ID"),
        name: z.string().describe("Translated item name"),
        description: z.string().optional().describe("Translated item description")
      })
      .nullable(),
    variants: z.array(
      z.object({
        variantId: z.string().describe("Original variant ID"),
        name: z.string().describe("Translated variant name"),
        description: z
          .string()
          .optional()
          .describe("Translated variant description")
      })
    )
  })

  export type MenuTranslationOutput = z.infer<typeof translationOutputSchema>
  export type ItemTranslationOutput = z.infer<typeof itemTranslationOutputSchema>

  type MenuItemPayload = {
    menuItemId: string
    name: string
    description?: string
    variants: Array<{
      variantId: string
      name: string
      description?: string
    }>
  }

  type CategoryPayload = {
    categoryId: string
    name: string
  }

  type SingleItemPayload = {
    menuItemId: string
    name: string
    description?: string
  } | null

  type VariantPayload = {
    variantId: string
    name: string
    description?: string
  }

  function extractJsonObject(text: string): unknown {
    const trimmed = text.trim()
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
    const candidate = fence?.[1]?.trim() ?? trimmed
    const start = candidate.indexOf("{")
    const end = candidate.lastIndexOf("}")
    if (start === -1 || end === -1 || end < start) {
      throw new Error("No JSON object in model response")
    }
    return JSON.parse(candidate.slice(start, end + 1))
  }

  function localeScriptRules(locale: SupportedLocaleCode): string {
    if (locale === "kk") {
      return `- Target language is Kazakh (Қазақша). Use Cyrillic script only; do not use Latin Kazakh orthography.`
    }
    return ""
  }

  function buildBulkUserPrompt(options: {
    locale: SupportedLocaleCode
    localeName: string
    items: MenuItemPayload[]
    categories: CategoryPayload[]
  }): string {
    const { locale, localeName, items, categories } = options
    return `You are a professional restaurant menu translator. Translate the following menu items and categories from their original language to ${localeName} (locale: ${locale}).
  Rules:
  - Translate names and descriptions naturally; preserve proper nouns (brand names, specific ingredient names) when appropriate.
  - If a field is empty or undefined, leave it empty in the output.
  - Return exactly the same IDs (menuItemId, variantId, categoryId) without modification.
  - Keep translations concise and appropriate for a restaurant menu.
  - Return ONLY a valid JSON object with this shape: {"items":[...],"categories":[...]}.
  - No markdown fences, no commentary.
  ${localeScriptRules(locale)}
  Categories to translate:
  ${JSON.stringify(categories, null, 2)}
  Menu items to translate:
  ${JSON.stringify(items, null, 2)}`
  }

  function buildSingleItemUserPrompt(options: {
    locale: SupportedLocaleCode
    localeName: string
    item: SingleItemPayload
    variants: VariantPayload[]
  }): string {
    const { locale, localeName, item, variants } = options
    return `You are a professional restaurant menu translator. Translate only the missing content for the following restaurant menu item into ${localeName} (locale: ${locale}).
  Rules:
  - Translate names and descriptions naturally; preserve proper nouns when appropriate.
  - If the item payload is null, keep item as null in the response.
  - Return exactly the same IDs (menuItemId, variantId) without modification.
  - If a field is empty or undefined, leave it empty in the output.
  - Return ONLY a valid JSON object with this shape: {"item":{...}|null,"variants":[...]}.
  - No markdown fences, no commentary.
  ${localeScriptRules(locale)}
  Missing item translation to generate:
  ${JSON.stringify(item, null, 2)}
  Missing variant translations to generate:
  ${JSON.stringify(variants, null, 2)}`
  }

  async function generateParsedOutput<T>(options: {
    schema: z.ZodType<T>
    userContent: string
  }): Promise<T> {
    const systemContent =
      "You translate restaurant menus. Always respond with valid JSON only."
    const messages = [
      { role: "system" as const, content: systemContent },
      { role: "user" as const, content: options.userContent }
    ]
    const maxAttempts = 2
    let lastError: Error | null = null
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const text = await runCloudflareWorkersAi({
          model: ACTIVE_MENU_TRANSLATION_MODEL,
          messages:
            attempt === 1
              ? messages
              : [
                  ...messages,
                  {
                    role: "user",
                    content:
                      "Your previous reply was invalid JSON. Return ONLY valid JSON for the same task, with no markdown."
                  }
                ],
          maxTokens: 8192,
          temperature: 0.2
        })
        const parsedJson = extractJsonObject(text)
        const parsed = options.schema.safeParse(parsedJson)
        if (!parsed.success) {
          throw new Error(parsed.error.message)
        }
        return parsed.data
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    }
    throw lastError ?? new Error("Menu translation failed")
  }

  export async function translateMenuPayload(options: {
    locale: SupportedLocaleCode
    localeName: string
    items: MenuItemPayload[]
    categories: CategoryPayload[]
  }): Promise<MenuTranslationOutput> {
    return generateParsedOutput({
      schema: translationOutputSchema,
      userContent: buildBulkUserPrompt(options)
    })
  }

  export async function translateSingleItemPayload(options: {
    locale: SupportedLocaleCode
    localeName: string
    item: SingleItemPayload
    variants: VariantPayload[]
  }): Promise<ItemTranslationOutput> {
    return generateParsedOutput({
      schema: itemTranslationOutputSchema,
      userContent: buildSingleItemUserPrompt(options)
    })
  }