"use client"

import { useMemo } from "react"
import { type Category } from "@/generated/prisma-client/client"
import type { ColumnDef } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Edit,
  Trash2
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import CategoryDelete from "@/app/dashboard/menu-items/categories/category-delete"
import CategoryEdit from "@/app/dashboard/menu-items/categories/category-edit"
import { ActionType } from "@/lib/types/category"

export function useCategoryColumns() {
  const t = useTranslations("dashboard.menuItems.categories")

  return useMemo(
    (): ColumnDef<Category>[] => [
      {
        accessorKey: "name",
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
        )
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const category = row.original
          return (
            <div className="flex justify-end gap-2">
              <CategoryEdit action={ActionType.UPDATE} category={category}>
                <Button variant="ghost" size="icon">
                  <Edit className="size-4 text-gray-700 dark:text-gray-400" />
                </Button>
              </CategoryEdit>
              <CategoryDelete category={category}>
                <Button variant="ghost" size="icon">
                  <Trash2 className="size-4 text-red-500" />
                </Button>
              </CategoryDelete>
            </div>
          )
        }
      }
    ],
    [t]
  )
}
