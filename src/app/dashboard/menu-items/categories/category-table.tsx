"use client"

import type { Category } from "@/generated/prisma-client/client"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import { useCategoryColumns } from "./columns"

export default function CategoryTable({ data }: { data: Category[] }) {
  const columns = useCategoryColumns()
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
