import Papa from "papaparse"

/** Canonical CSV fields used after normalizing localized headers. */
export type MenuItemCsvFields = {
  name: string
  variant?: string
  description?: string
  price: string
  category?: string
  currency?: string
}

export type MenuItemCsvColumnLabels = {
  name: string
  variant: string
  description: string
  price: string
  category: string
  currency: string
}

type CanonicalField = keyof MenuItemCsvFields

/** Always-accepted aliases (legacy Spanish + English + Russian). */
const STATIC_ALIASES: Record<CanonicalField, string[]> = {
  name: ["nombre", "name", "название"],
  variant: ["variante", "variant", "вариант"],
  description: ["descripcion", "descripción", "description", "описание"],
  price: ["precio", "price", "цена"],
  category: ["categoria", "categoría", "category", "категория"],
  currency: ["moneda", "currency", "валюта"]
}

function normalizeHeader(value: string): string {
  return value.trim().toLocaleLowerCase()
}

function buildHeaderLookup(
  labels: MenuItemCsvColumnLabels
): Map<string, CanonicalField> {
  const lookup = new Map<string, CanonicalField>()

  for (const field of Object.keys(STATIC_ALIASES) as CanonicalField[]) {
    for (const alias of STATIC_ALIASES[field]) {
      lookup.set(normalizeHeader(alias), field)
    }
    lookup.set(normalizeHeader(labels[field]), field)
  }

  return lookup
}

/** Map a parsed CSV row (any supported header language) to canonical fields. */
export function normalizeMenuItemCsvRow(
  row: Record<string, string | undefined>,
  labels: MenuItemCsvColumnLabels
): Partial<MenuItemCsvFields> {
  const lookup = buildHeaderLookup(labels)
  const normalized: Partial<MenuItemCsvFields> = {}

  for (const [header, value] of Object.entries(row)) {
    const field = lookup.get(normalizeHeader(header))
    if (!field) continue
    normalized[field] = value
  }

  return normalized
}

/** Build a CSV row object whose keys are the localized column headers. */
export function toLocalizedMenuItemCsvRow(
  fields: MenuItemCsvFields,
  labels: MenuItemCsvColumnLabels
): Record<string, string | undefined> {
  return {
    [labels.name]: fields.name,
    [labels.variant]: fields.variant,
    [labels.description]: fields.description,
    [labels.price]: fields.price,
    [labels.category]: fields.category,
    [labels.currency]: fields.currency
  }
}

/** Download CSV with UTF-8 BOM so Excel opens Cyrillic correctly. */
export function downloadMenuItemsCsvFile(
  rows: Array<Record<string, string | undefined>>,
  fileName: string
) {
  const csv = "\uFEFF" + Papa.unparse(rows)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
