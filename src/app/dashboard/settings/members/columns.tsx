"use client"

import { useMemo, useState } from "react"
import { type ColumnDef, type Row } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  MoreHorizontal
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import MemberDelete from "@/app/dashboard/settings/members/member-delete"
import type { AuthMember } from "@/lib/auth"
import { getInitials } from "@/lib/utils"

export function useMemberColumns(canDeleteMember: boolean) {
  const t = useTranslations("dashboard.settings.members")
  const tCommon = useTranslations("dashboard.common")

  return useMemo((): ColumnDef<AuthMember>[] => {
    return [
      {
        accessorKey: "user.name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("user")}
            {{
              asc: <ChevronUp className="ml-2 h-4 w-4" />,
              desc: <ChevronDown className="ml-2 h-4 w-4" />
            }[column.getIsSorted() as string] ?? (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const member = row.original
          const name =
            member.user?.name ?? member.user?.email ?? t("userFallback")
          const email = member.user?.email ?? ""
          const initials = getInitials(name)

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.user?.image ?? undefined} alt={name} />
                <AvatarFallback>{initials || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{name}</span>
                {email ? (
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                ) : null}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: "role",
        header: t("role"),
        cell: ({ row }) => {
          const role = row.original.role
          const label =
            role === "owner"
              ? t("roleOwner")
              : role === "admin"
                ? t("roleAdmin")
                : t("roleMember")
          return <span className="text-sm">{label}</span>
        }
      },
      {
        id: "actions",
        cell: props => (
          <ActionsColumn
            row={props.row}
            canDeleteMember={canDeleteMember}
            actionsLabel={tCommon("actions")}
            removeLabel={t("remove")}
          />
        )
      }
    ]
  }, [canDeleteMember, t, tCommon])
}

function ActionsColumn({
  row,
  canDeleteMember,
  actionsLabel,
  removeLabel
}: {
  row: Row<AuthMember>
  canDeleteMember: boolean
  actionsLabel: string
  removeLabel: string
}) {
  const member = row.original
  const [openDelete, setOpenDelete] = useState(false)

  if (!canDeleteMember) return null

  if (member.role === "owner" || member.role === "admin") {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="hover:bg-gray-100">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{actionsLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setOpenDelete(true)
            }}
          >
            <span className="text-red-500">{removeLabel}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MemberDelete open={openDelete} setOpen={setOpenDelete} member={member} />
    </>
  )
}
