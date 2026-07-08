"use client"

import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
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
import { deleteVariant } from "@/server/actions/item/mutations"
import { cn } from "@/lib/utils"

export default function VariantDelete({
  children,
  variantId,
  menuItemId
}: {
  children: React.ReactNode
  variantId: string | undefined
  menuItemId: string | undefined
}) {
  const t = useTranslations("dashboard.menuItems.variants")
  const tCommon = useTranslations("dashboard.common")

  const { execute, reset } = useAction(deleteVariant, {
    onExecute: () => {
      toast.loading(t("deleting"))
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
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "variant-delete" },
        extra: { variantId, menuItemId }
      })
      toast.dismiss()
      toast.error(tCommon("genericError"))
      reset()
    }
  })

  const onDeleteVariant = () => {
    execute({
      id: variantId ?? "",
      menuItemId: menuItemId ?? ""
    })
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
            onClick={() => onDeleteVariant()}
          >
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
