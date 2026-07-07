"use client"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import type { AuthMember } from "@/lib/auth"
import { useMemberColumns } from "./columns"

export default function MemberTable({
  data,
  canDeleteMember
}: {
  data: AuthMember[]
  canDeleteMember: boolean
}) {
  const cols = useMemberColumns(canDeleteMember)

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data,
    columns: cols
  })

  return (
    <DataTable
      columns={cols}
      table={table}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  )
}
