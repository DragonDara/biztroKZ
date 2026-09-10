import Papa from "papaparse"

export const MENU_TRANSLATION_CSV_TYPES = [
  "item",
  "variant",
  "category"
] as const

export type MenuTranslationCsvType =
  (typeof MENU_TRANSLATION_CSV_TYPES)[number]

export type MenuTranslationCsvFields = {
  type: MenuTranslationCsvType
  id: string
  sourceName: string
  sourceDescription?: string
  translatedName?: string
  translatedDescription?: string
}

export type MenuTranslationCsvColumnLabels = {
  type: string
  id: string
  sourceName: string
  sourceDescription: string
  translatedName: string
  translatedDescription: string
}

type CanonicalField = keyof MenuTranslationCsvFields

/** Always-accepted aliases (English + Russian + Spanish). */
const STATIC_ALIASES: Record<CanonicalField, string[]> = {
  type: ["type", "тип", "tipo"],
  id: ["id"],
  sourceName: [
    "source_name",
    "source name",
    "sourcename",
    "исходное название",
    "nombre original"
  ],
  sourceDescription: [
    "source_description",
    "source description",
    "sourcedescription",
    "исходное описание",
    "descripción original",
    "descripcion original"
  ],
  translatedName: [
    "translated_name",
    "translated name",
    "translatedname",
    "перевод названия",
    "nombre traducido"
  ],
  translatedDescription: [
    "translated_description",
    "translated description",
    "translateddescription",
    "перевод описания",
    "descripción traducida",
    "descripcion traducida"
  ]
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().toLocaleLowerCase()
}

function buildHeaderLookup(
  labels: MenuTranslationCsvColumnLabels
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

export function isMenuTranslationCsvType(
  value: string
): value is MenuTranslationCsvType {
  return (MENU_TRANSLATION_CSV_TYPES as readonly string[]).includes(value)
}

/** Map a parsed CSV row to canonical translation fields. */
export function normalizeMenuTranslationCsvRow(
  row: Record<string, string | undefined>,
  labels: MenuTranslationCsvColumnLabels
): Partial<MenuTranslationCsvFields> {
  const lookup = buildHeaderLookup(labels)
  const normalized: Partial<MenuTranslationCsvFields> = {}

  for (const [header, value] of Object.entries(row)) {
    const field = lookup.get(normalizeHeader(header))
    if (!field || value === undefined) continue

    if (field === "type") {
      const typeValue = value.trim().toLocaleLowerCase()
      if (isMenuTranslationCsvType(typeValue)) {
        normalized.type = typeValue
      }
      continue
    }

    normalized[field] = value
  }

  return normalized
}

/** Build a CSV row object whose keys are the localized column headers. */
export function toLocalizedMenuTranslationCsvRow(
  fields: MenuTranslationCsvFields,
  labels: MenuTranslationCsvColumnLabels
): Record<string, string | undefined> {
  return {
    [labels.type]: fields.type,
    [labels.id]: fields.id,
    [labels.sourceName]: fields.sourceName,
    [labels.sourceDescription]: fields.sourceDescription ?? "",
    [labels.translatedName]: fields.translatedName ?? "",
    [labels.translatedDescription]: fields.translatedDescription ?? ""
  }
}

/** Download CSV with UTF-8 BOM so Excel opens Cyrillic correctly. */
export function downloadMenuTranslationsCsvFile(
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
