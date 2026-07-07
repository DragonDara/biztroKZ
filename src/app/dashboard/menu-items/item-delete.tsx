"use client"

import toast from "react-hot-toast"
import type { MenuItem } from "@/generated/prisma-client/client"
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
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { deleteItem } from "@/server/actions/item/mutations"
import { cn } from "@/lib/utils"

export default function ItemDelete({
  item,
  open,
  setOpen
}: {
  item: MenuItem
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const t = useTranslations("dashboard.menuItems.products")
  const tCommon = useTranslations("dashboard.common")

  const { execute, reset } = useAction(deleteItem, {
    onExecute: () => {
      toast(t("deleting"), { icon: "🗑️" })
    },
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.dismiss()
        toast.error(data.failure.reason)
      } else if (data?.success) {
        toast.dismiss()
      }
      reset()
    },
    onError: () => {
      toast.dismiss()
      toast.error(tCommon("genericError"))
      reset()
    }
  })

  const onDeleteItem = () => {
    execute(item)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={event => event.stopPropagation()}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={event => {
              event.stopPropagation()
              onDeleteItem()
            }}
          >
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
