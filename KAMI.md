## fetching data from kami-qr.

- open the needed kami-qr based qr menu website. 
- open the console and paste the script below:

```
(() => {
  const data = window.__data__?.data;

  if (!data) {
    throw new Error("window.__data__.data not found");
  }

  const sectionId =
    new URL(location.href).searchParams.get("current_section");

  if (!sectionId) {
    throw new Error("current_section not found in URL");
  }

  const treeSection = data.tree?.sections?.find(
    section => section.sectionId === sectionId
  );

  if (!treeSection) {
    throw new Error(`Section not found: ${sectionId}`);
  }

  const section = data.sections?.[sectionId];

  const rows = [];

  for (const categoryRef of treeSection.categories ?? []) {
    const category = data.categories?.[categoryRef.categoryId];

    for (const itemRef of categoryRef.items ?? []) {
      const item = data.items?.[itemRef.itemId];

      if (!item) continue;

      rows.push({
        section_id: sectionId,
        section_ru: section?.name?.RU ?? "",
        section_kz: section?.name?.KZ ?? "",
        section_en: section?.name?.EN ?? "",

        category_id: category?._id ?? categoryRef.categoryId ?? "",
        category_ru: category?.name?.RU ?? "",
        category_kz: category?.name?.KZ ?? "",
        category_en: category?.name?.EN ?? "",

        item_id: item._id ?? itemRef.itemId ?? "",
        item_ru: item.name?.RU ?? "",
        item_kz: item.name?.KZ ?? "",
        item_en: item.name?.EN ?? "",

        description_ru:
          item.specs?.shortDesc?.RU ??
          item.specs?.fullDesc?.RU ??
          "",

        description_kz:
          item.specs?.shortDesc?.KZ ??
          item.specs?.fullDesc?.KZ ??
          "",

        description_en:
          item.specs?.shortDesc?.EN ??
          item.specs?.fullDesc?.EN ??
          "",

        price_raw:
          item.prices?.primary?.price ?? 0,

        price_kzt:
          (item.prices?.primary?.price ?? 0) / 100,

        image:
          item.mainImg ?? "",

        grams:
          item.specs?.grams ?? 0,

        hidden:
          item.isHidden ?? false,

        off:
          item.isOff ?? false
      });
    }
  }

  if (!rows.length) {
    throw new Error("No menu items found");
  }

  const headers = [
    "section_id",
    "section_ru",
    "section_kz",
    "section_en",

    "category_id",
    "category_ru",
    "category_kz",
    "category_en",

    "item_id",
    "item_ru",
    "item_kz",
    "item_en",

    "description_ru",
    "description_kz",
    "description_en",

    "price_raw",
    "price_kzt",

    "image",
    "grams",
    "hidden",
    "off"
  ];

  function escapeCsv(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return `"${String(value).replaceAll('"', '""')}"`;
  }

  const csv = [
    headers.map(escapeCsv).join(","),

    ...rows.map(row =>
      headers
        .map(header => escapeCsv(row[header]))
        .join(",")
    )
  ].join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "kami-menu.csv";

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

  console.log(
    `Downloaded kami-menu.csv: ${rows.length} items`
  );

  console.table(rows);
})();
```

- the script automatically loads a .csv file in your /downloads/ directory that you can use when importing on qrmenu.bron;

that's all. gl hf!
