import { useState } from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type SortingState
} from "@tanstack/react-table"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wordFilter: FilterFn<any> = (row, _columnId, value) => {
  const query = String(value ?? "")
    .trim()
    .toLowerCase()
  if (!query) return true

  const words = query.split(/\s+/).filter(Boolean)
  const haystack = row
    .getAllCells()
    .filter(cell => cell.column.getCanGlobalFilter())
    .map(cell => String(cell.getValue() ?? "").toLowerCase())
    .join(" ")

  return words.every(word => haystack.includes(word))
}

export function useDataTable<TData, TValue>({
  data,
  columns
}: {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: wordFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter
    }
  })

  return { table, globalFilter, setGlobalFilter }
}
