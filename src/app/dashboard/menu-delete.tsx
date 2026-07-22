"use client"

import toast from "react-hot-toast"
import type { Menu } from "@/generated/prisma-client/client"
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
import { deleteMenu } from "@/server/actions/menu/mutations"
import { cn } from "@/lib/utils"

export default function MenuDelete({
  menu,
  open,
  setOpen
}: {
  menu: Menu
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const t = useTranslations("dashboard.menus")
  const tCommon = useTranslations("dashboard.common")

  const { execute, reset } = useAction(deleteMenu, {
    onExecute: () => {
      toast.loading(t("deleteLoading"))
    },
    onSuccess: ({ data }) => {
      toast.dismiss()
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      } else if (data?.success) {
        toast.success(t("deleted"))
      }
      reset()
    },
    onError: () => {
      toast.error(tCommon("genericError"))
      reset()
    }
  })

  const onDeleteMenu = () => {
    execute({ id: menu.id, organizationId: menu.organizationId })
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
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => onDeleteMenu()}
          >
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
