You are fixing the Kami-QR CSV import in the local `biztroKZ` working tree.

Do **not** inspect or rely on the remote GitHub branch to determine whether the implementation exists. Work against the current local files and current local changes.

## Current bug

A real Kami CSV is being uploaded, but the importer reports errors such as:

```text
Название обязательно
Цена обязательна
```

The CSV itself contains the required data, but under Kami-specific column names:

```text
section_id
section_ru
section_kz
section_en
category_id
category_ru
category_kz
category_en
item_id
item_ru
item_kz
item_en
description_ru
description_kz
description_en
price_raw
price_kzt
image
grams
hidden
off
```

Example real Kami row:

```text
item_id = 683a3276-a258-4a4f-8140-ac900560639f
item_ru = Татаки из лосося
category_ru = Закуски
price_kzt = 3990
image = f8a88c55a6a1463695dbe01ebcfdf88c.jpeg
```

This row must normalize to approximately:

```ts
{
  name: "Татаки из лосося",
  description: undefined,
  price: "3990",
  category: "Закуски",
  currency: "KZT",
  externalId: "683a3276-a258-4a4f-8140-ac900560639f",
  image:
    "https://kamigroup.fra1.cdn.digitaloceanspaces.com/kami/prod/menuItemThumbnails/f8a88c55a6a1463695dbe01ebcfdf88c_thumb.jpeg"
}
```

## Important likely issue: UTF-8 BOM / header normalization

The CSV may contain a UTF-8 BOM at the beginning of the first header.

For example, Papa Parse may expose the first field as:

```ts
"\uFEFFsection_id"
```

instead of:

```ts
"section_id"
```

If Kami detection uses raw header comparisons, it can fail and incorrectly route the CSV through the normal bron.cafe CSV normalizer.

Fix header normalization at the parsing boundary.

In `Papa.parse`, add or use `transformHeader` so every header is normalized:

```ts
transformHeader: header =>
  header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
```

Do not only patch `section_id`; normalize all headers consistently.

## Detect Kami format once per CSV

Do not detect the source independently for every row if `results.meta.fields` is available.

Use the normalized CSV headers once:

```ts
const isKami = isKamiMenuCsv(results.meta.fields ?? [])
```

A Kami detector should be explicit but not unnecessarily brittle.

For example:

```ts
export function isKamiMenuCsv(fields: string[]): boolean {
  const headers = new Set(
    fields.map(field =>
      field
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
    )
  )

  return (
    headers.has("item_id") && headers.has("item_ru") && headers.has("price_kzt")
  )
}
```

Do **not** require unrelated optional fields such as `section_id`, `item_en`, descriptions, images, etc. just to recognize a Kami export.

## Kami normalization

Keep Kami-specific mapping isolated from the generic bron.cafe CSV aliases.

Implement or fix something equivalent to:

```ts
normalizeKamiMenuCsvRow(rawRow)
```

Mapping:

```text
item_ru        -> name
description_ru -> description
price_kzt      -> price
category_ru    -> category
item_id        -> externalId
image          -> generated full Kami thumbnail URL
                -> currency = KZT
```

Example:

```ts
export function normalizeKamiMenuCsvRow(
  row: KamiMenuCsvRow
): Partial<MenuItemCsvFields> {
  return {
    name: row.item_ru?.trim(),
    description: row.description_ru?.trim() || undefined,
    price: row.price_kzt?.trim(),
    category: row.category_ru?.trim(),
    currency: "KZT",
    externalId: row.item_id?.trim(),
    image: buildKamiThumbnailUrl(row.image)
  }
}
```

Do not use `price_raw` when `price_kzt` is available.

## Image URL generation

Kami gives this:

```text
f8a88c55a6a1463695dbe01ebcfdf88c.jpeg
```

but the actual public thumbnail is:

```text
https://kamigroup.fra1.cdn.digitaloceanspaces.com/kami/prod/menuItemThumbnails/f8a88c55a6a1463695dbe01ebcfdf88c_thumb.jpeg
```

Implement/fix a pure helper such as:

```ts
buildKamiThumbnailUrl(value?: string)
```

Requirements:

- Trim whitespace.
- Empty value -> `undefined`.
- Existing `https://...` URL -> preserve as-is.
- Filename -> insert `_thumb` before the final extension.
- Support at least `.jpg`, `.jpeg`, `.png`, `.webp`.
- Do not manually require users to alter their Kami CSV.

Examples:

```text
abc.jpeg -> abc_thumb.jpeg
abc.jpg  -> abc_thumb.jpg
abc.png  -> abc_thumb.png
```

with base:

```text
https://kamigroup.fra1.cdn.digitaloceanspaces.com/kami/prod/menuItemThumbnails/
```

## Import flow

The desired flow is:

```text
Papa.parse
    |
    v
normalize headers / strip BOM
    |
    v
detect CSV format ONCE
    |
    +----------------------------+
    |                            |
    v                            v
Kami CSV                  bron.cafe CSV
    |                            |
    v                            v
normalizeKami...          normalizeMenuItemCsvRow(...)
    |                            |
    +-------------+--------------+
                  |
                  v
            validateRow(...)
                  |
                  v
            BulkMenuItem
                  |
                  v
           bulkCreateItems()
                  |
                  v
     fetchAndStoreExternalImage()
                  |
                  v
               R2
```

Do not duplicate the rest of the import pipeline.

Conceptually:

```ts
complete: results => {
  const isKami = isKamiMenuCsv(results.meta.fields ?? [])

  results.data.forEach((rawRow, index) => {
    const row = isKami
      ? normalizeKamiMenuCsvRow(rawRow)
      : normalizeMenuItemCsvRow(rawRow, columnLabels)

    const rowErrors = validateRow(row, key => tValidation(key))

    // existing logic continues
  })
}
```

Adapt this to existing local code/style rather than copying blindly.

## Do not weaken validation

Keep the current image validation requiring a valid HTTPS URL:

```ts
const parsed = new URL(row.image.trim())

if (parsed.protocol !== "https:") {
  // error
}
```

Kami's filename must be transformed into the correct URL **before** this validation.

Do not make the validator accept arbitrary filenames.

## Debug before changing blindly

Before editing, inspect the current local implementations of:

```text
src/app/dashboard/menu-items/import-options.tsx
src/lib/menu-items-csv.ts
```

and any existing Kami-specific helper the previous implementation created.

Temporarily verify what Papa actually produces:

```ts
console.log("CSV fields:", results.meta.fields)
console.log("first raw row:", results.data[0])
console.log("is Kami:", isKami)
```

If useful, also inspect the normalized first row:

```ts
console.log("normalized:", row)
```

Remove temporary debug logging when finished unless existing project conventions justify keeping it.

The important check is that for a real Kami file:

```ts
isKami === true
```

and the first normalized row contains:

```ts
row.name === "Татаки из лосося"
row.price === "3990"
```

before `validateRow()` executes.

## Existing bron.cafe CSV must not break

The normal bron.cafe template/import format must still work:

```text
name
variant
description
price
category
currency
image
externalId
```

Do not globally reinterpret normal bron.cafe CSV rows as Kami.

## Do not refactor unrelated architecture

Do not add:

- queues/background jobs
- new Prisma fields/migrations
- translation migration
- generic provider framework
- R2 replacement
- new image storage mechanism
- unrelated UI redesign

This task is specifically to make the current real Kami CSV correctly reach the existing import pipeline.

## Acceptance criteria

The implementation is done when a real Kami CSV containing:

```text
item_ru = Татаки из лосося
price_kzt = 3990
category_ru = Закуски
item_id = 683a3276-a258-4a4f-8140-ac900560639f
image = f8a88c55a6a1463695dbe01ebcfdf88c.jpeg
```

is recognized as Kami and normalizes to:

```ts
{
  name: "Татаки из лосося",
  price: "3990",
  category: "Закуски",
  currency: "KZT",
  externalId: "683a3276-a258-4a4f-8140-ac900560639f",
  image:
    "https://kamigroup.fra1.cdn.digitaloceanspaces.com/kami/prod/menuItemThumbnails/f8a88c55a6a1463695dbe01ebcfdf88c_thumb.jpeg"
}
```

and **does not** produce:

```text
Название обязательно
Цена обязательна
```

Also confirm:

- Kami item without image still imports.
- Existing bron.cafe CSV still works.
- No manual modification of Kami CSV is necessary.
- No manual construction of Kami image URLs is necessary.

Finally run:

```bash
bun run lint
bun run typecheck
```

Fix errors introduced by this change.

In your final response tell me:

1. What the actual root cause was.
2. Which files you changed.
3. How Kami detection now works.
4. Show the normalized first Kami row.
5. Results of `bun run lint` and `bun run typecheck`.
