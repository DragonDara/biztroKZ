/**
 * Canonical craft block display names and locale aliases (ES/EN/RU).
 * Shared by client UI resolution and server serial-data / public menu parsing.
 */

export const BLOCK_DISPLAY_NAME = {
  site: "site",
  header: "header",
  category: "category",
  product: "product",
  navigation: "navigation",
  featured: "featured",
  heading: "heading",
  text: "text"
} as const

export type BlockDisplayNameKey =
  (typeof BLOCK_DISPLAY_NAME)[keyof typeof BLOCK_DISPLAY_NAME]

/**
 * Maps stored craft display names (canonical keys + ES/EN/RU aliases)
 * to translation keys under menuEditor.blocks.displayNames.
 */
export const DISPLAY_NAME_ALIASES: Record<string, BlockDisplayNameKey> = {
  // Canonical keys (current craft defaults)
  site: "site",
  header: "header",
  category: "category",
  product: "product",
  navigation: "navigation",
  featured: "featured",
  heading: "heading",
  text: "text",

  // Spanish (legacy craft defaults / old serial data)
  Sitio: "site",
  Cabecera: "header",
  Categoría: "category",
  Producto: "product",
  Navegación: "navigation",
  Recomendados: "featured",
  Encabezado: "heading",
  Texto: "text",

  // English (localized custom names)
  Site: "site",
  Header: "header",
  Category: "category",
  Product: "product",
  Navigation: "navigation",
  Featured: "featured",
  Heading: "heading",
  Text: "text",

  // Russian (localized custom names)
  Сайт: "site",
  Шапка: "header",
  Категория: "category",
  Продукт: "product",
  Навигация: "navigation",
  Рекомендуемое: "featured",
  Заголовок: "heading",
  Текст: "text"
}

export function resolveBlockDisplayNameKey(
  name: string | undefined
): BlockDisplayNameKey | undefined {
  if (!name) return undefined
  return DISPLAY_NAME_ALIASES[name]
}

/**
 * If `name` is a known canonical key or ES/EN/RU alias, return the key.
 * Otherwise return the trimmed custom label unchanged.
 */
export function canonicalizeBlockDisplayName(name: string): string {
  const trimmed = name.trim()
  return resolveBlockDisplayNameKey(trimmed) ?? trimmed
}

export function isBlockDisplayName(
  name: string | undefined,
  key: BlockDisplayNameKey
): boolean {
  return resolveBlockDisplayNameKey(name) === key
}
