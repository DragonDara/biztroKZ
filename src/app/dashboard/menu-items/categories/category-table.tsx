"use client"

import { DataTable } from "@/components/data-table/data-table"
import type {
  getCategories,
  getMenuSections
} from "@/server/actions/item/queries"
import { useDataTable } from "@/hooks/use-data-table"
import { useCategoryColumns } from "./columns"

export default function CategoryTable({
  data,
  menuSections
}: {
  data: Awaited<ReturnType<typeof getCategories>>
  menuSections: Awaited<ReturnType<typeof getMenuSections>>
}) {
  const columns = useCategoryColumns(menuSections)
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data,
    columns
  })

  return (
    <DataTable
      columns={columns}
      table={table}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  )
}
