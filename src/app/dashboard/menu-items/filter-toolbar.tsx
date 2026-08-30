"use client"

import { useTranslations } from "next-intl"
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs"

import { DataTableFilter } from "@/components/data-table/data-table-filter"
import type { getCategories } from "@/server/actions/item/queries"
import { getCategoryLabel } from "@/lib/category-label"
import { MenuItemStatus } from "@/lib/types/menu-item"

export default function FilterToolbar({
  categories
}: {
  categories: Awaited<ReturnType<typeof getCategories>>
}) {
  const t = useTranslations("dashboard.menuItems.products")

  const status = [
    { value: MenuItemStatus.ACTIVE, label: t("statusActive") },
    { value: MenuItemStatus.DRAFT, label: t("statusDraft") },
    { value: MenuItemStatus.ARCHIVED, label: t("statusArchived") }
  ]

  const [categoryValue, setCategoryValue] = useQueryState(
    "category",
    parseAsArrayOf(parseAsString)
      .withOptions({
        shallow: false,
        throttleMs: 300
      })
      .withDefault([])
  )

  const [statusValue, setStatusValue] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString)
      .withOptions({
        shallow: false,
        throttleMs: 300
      })
      .withDefault([])
  )

  return (
    <div className="flex grow flex-row items-center gap-x-2">
      <DataTableFilter
        title={t("filterStatus")}
        options={status}
        value={statusValue}
        onChange={setStatusValue}
      />
      <DataTableFilter
        title={t("filterCategory")}
        options={
          categories?.map(category => ({
            value: category.id,
            label: getCategoryLabel(category)
          })) ?? []
        }
        value={categoryValue}
        onChange={setCategoryValue}
      />
    </div>
  )
}
