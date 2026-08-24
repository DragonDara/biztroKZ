import type { MenuItemCsvFields } from "@/lib/menu-items-csv"

const KAMI_THUMBNAIL_BASE_URL =
  "https://kamigroup.fra1.cdn.digitaloceanspaces.com/kami/prod/menuItemThumbnails/"

const KAMI_REQUIRED_HEADERS = ["item_id", "item_ru", "price_kzt"] as const

export type KamiMenuCsvRow = Record<string, string | undefined> & {
  section_id?: string
  section_ru?: string
  section_kz?: string
  section_en?: string
  category_id?: string
  category_ru?: string
  category_kz?: string
  category_en?: string
  item_id?: string
  item_ru?: string
  item_kz?: string
  item_en?: string
  description_ru?: string
  description_kz?: string
  description_en?: string
  price_raw?: string
  price_kzt?: string
  image?: string
  grams?: string
  hidden?: string
  off?: string
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLocaleLowerCase()
}

function normalizeKamiRowKeys(
  row: Record<string, string | undefined>
): KamiMenuCsvRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
  )
}

function trimOptional(value?: string): string | undefined {
  return value?.trim() || undefined
}

/** Identify Kami exports by their provider-specific core columns. */
export function isKamiMenuCsv(fields: string[]): boolean {
  const headers = new Set(fields.map(normalizeHeader))
  return KAMI_REQUIRED_HEADERS.every(header => headers.has(header))
}

/** Convert a Kami image filename to its public thumbnail URL. */
export function buildKamiThumbnailUrl(value?: string): string | undefined {
  const image = trimOptional(value)
  if (!image) return undefined

  try {
    const url = new URL(image)
    if (url.protocol === "https:") return image
    return image
  } catch {
    // Filename-only values are handled below; other invalid values remain invalid
    // so the canonical importer can report its existing image validation error.
  }

  const extensionIndex = image.lastIndexOf(".")
  const isSafeFilename =
    extensionIndex > 0 &&
    extensionIndex < image.length - 1 &&
    !/[\\/?#]/.test(image) &&
    /^[a-zA-Z0-9._-]+$/.test(image)

  if (!isSafeFilename) return image

  const thumbnailName = `${image.slice(0, extensionIndex)}_thumb${image.slice(extensionIndex)}`
  return `${KAMI_THUMBNAIL_BASE_URL}${thumbnailName}`
}

/** Map a Kami export row to the canonical bron.cafe CSV fields. */
export function normalizeKamiMenuCsvRow(
  row: Record<string, string | undefined>
): Partial<MenuItemCsvFields> {
  const kamiRow = normalizeKamiRowKeys(row)

  return {
    name: trimOptional(kamiRow.item_ru),
    description: trimOptional(kamiRow.description_ru),
    price: trimOptional(kamiRow.price_kzt),
    category: trimOptional(kamiRow.category_ru),
    currency: "KZT",
    image: buildKamiThumbnailUrl(kamiRow.image),
    externalId: trimOptional(kamiRow.item_id)
  }
}
