"use client"

import toast from "react-hot-toast"
import type { Category } from "@/generated/prisma-client/client"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { deleteCategory } from "@/server/actions/item/mutations"
import { cn } from "@/lib/utils"

export default function CategoryDelete({
  category,
  children
}: {
  category: Category
  children: React.ReactNode
}) {
  const t = useTranslations("dashboard.menuItems.categories")
  const tCommon = useTranslations("dashboard.common")

  const { execute, reset } = useAction(deleteCategory, {
    onExecute: () => {
      toast(t("deleting"), { icon: "🗑️" })
    },
    onSuccess: async ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      }
      reset()
    },
    onError: () => {
      toast.dismiss()
      toast.error(tCommon("genericError"))
      reset()
    }
  })

  const onDeleteCategory = () => {
    execute(category)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => onDeleteCategory()}
          >
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
