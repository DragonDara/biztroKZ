"use client"

import { useMemo, useState } from "react"
import { type ColumnDef, type Row } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  MoreHorizontal,
  Star
} from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { getMenuItems } from "@/server/actions/item/queries"
import ItemDelete from "@/app/dashboard/menu-items/item-delete"
import { formatPrice, resolveCurrency } from "@/lib/currency"
import { MenuItemStatus } from "@/lib/types/menu-item"

type MenuItemRow = Awaited<ReturnType<typeof getMenuItems>>[number]

export function useMenuItemColumns() {
  const t = useTranslations("dashboard.menuItems.products")
  const tCommon = useTranslations("dashboard.common")

  return useMemo((): ColumnDef<MenuItemRow>[] => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={() => table.toggleAllPageRowsSelected()}
            aria-label={t("selectAllRows")}
            className="hit-area-3 translate-y-0.5"
          />
        ),
        cell: ({ row }) => (
          <div onClick={e => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={() => row.toggleSelected()}
              aria-label={t("selectRow")}
              className="hit-area-3 translate-y-0.5"
            />
          </div>
        )
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("columnProduct")}
            {{
              asc: <ChevronUp className="ml-2 h-4 w-4" />,
              desc: <ChevronDown className="ml-2 h-4 w-4" />
            }[column.getIsSorted() as string] ?? (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const item = row.original
          if (!item) return null
          return (
            <div className="flex items-center justify-between gap-2">
              <span>{item.name}</span>
              {item.featured ? (
                <Star
                  className="size-3 fill-orange-400 text-orange-400
                    dark:fill-yellow-400 dark:text-yellow-400"
                />
              ) : null}
            </div>
          )
        }
      },
      {
        accessorKey: "description",
        header: t("columnDescription"),
        enableHiding: true
      },
      {
        accessorKey: "category.name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("columnCategory")}
            {{
              asc: <ChevronUp className="ml-2 h-4 w-4" />,
              desc: <ChevronDown className="ml-2 h-4 w-4" />
            }[column.getIsSorted() as string] ?? (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        enableHiding: true
      },
      {
        accessorKey: "status",
        header: t("columnStatus"),
        enableHiding: true,
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell"
        },
        cell: ({ row }) => {
          const item = row.original
          switch (item?.status) {
            case MenuItemStatus.ACTIVE:
              return (
                <Badge variant="green" className="rounded-full">
                  {t("statusActive")}
                </Badge>
              )
            case MenuItemStatus.DRAFT:
              return (
                <Badge variant="violet" className="rounded-full">
                  {t("statusDraft")}
                </Badge>
              )
            case MenuItemStatus.ARCHIVED:
              return (
                <Badge variant="secondary" className="rounded-full">
                  {t("statusArchived")}
                </Badge>
              )
            default:
              return null
          }
        }
      },
      {
        accessorKey: "variants",
        header: t("columnPrice"),
        cell: ({ row }) => {
          const item = row.original
          if (!item?.variants) return null

          if (item.variants.length > 1) {
            const prices = item.variants.map(variant => variant.price)
            const minPrice = Math.min(...prices)
            const maxPrice = Math.max(...prices)
            return (
              <>
                {formatPrice(
                  minPrice,
                  resolveCurrency(
                    (item as unknown as { currency?: string }).currency
                  )
                )}{" "}
                -{" "}
                {formatPrice(
                  maxPrice,
                  resolveCurrency(
                    (item as unknown as { currency?: string }).currency
                  )
                )}
              </>
            )
          }

          if (item.variants[0]?.price) {
            return (
              <>
                {formatPrice(
                  item.variants[0].price,
                  resolveCurrency(
                    (item as unknown as { currency?: string }).currency
                  )
                )}
              </>
            )
          }

          return null
        }
      },
      {
        id: "actions",
        cell: props => (
          <ActionsColumn
            row={props.row}
            actionsLabel={tCommon("actions")}
            editLabel={tCommon("edit")}
            deleteLabel={tCommon("delete")}
          />
        )
      }
    ]
  }, [t, tCommon])
}

function ActionsColumn({
  row,
  actionsLabel,
  editLabel,
  deleteLabel
}: {
  row: Row<MenuItemRow>
  actionsLabel: string
  editLabel: string
  deleteLabel: string
}) {
  const item = row.original
  const [openDelete, setOpenDelete] = useState(false)

  if (!item) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuLabel>{actionsLabel}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/menu-items/edit/${item.id}`}
              prefetch={false}
            >
              <span>{editLabel}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={event => {
              event.stopPropagation()
              setOpenDelete(true)
            }}
          >
            <span className="text-red-500">{deleteLabel}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ItemDelete item={item} open={openDelete} setOpen={setOpenDelete} />
    </>
  )
}
