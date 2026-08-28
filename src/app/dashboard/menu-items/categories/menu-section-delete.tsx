"use client"

import toast from "react-hot-toast"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

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
import { deleteMenuSection } from "@/server/actions/item/mutations"
import type { getMenuSections } from "@/server/actions/item/queries"
import { cn } from "@/lib/utils"

type MenuSection = Awaited<ReturnType<typeof getMenuSections>>[number]

export default function MenuSectionDelete({
  children,
  menuSection
}: {
  children: React.ReactNode
  menuSection: MenuSection
}) {
  const t = useTranslations("dashboard.menuItems.categories")
  const tCommon = useTranslations("dashboard.common")
  const router = useRouter()
  const { execute, reset } = useAction(deleteMenuSection, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) toast.error(data.failure.reason)
      if (data?.success) {
        toast.success(t("menuSectionDeleted"))
        router.refresh()
      }
      reset()
    },
    onError: () => {
      toast.error(t("menuSectionDeleteError"))
      reset()
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("menuSectionDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("menuSectionDeleteDescription", {
              count: menuSection._count.categories
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => execute(menuSection)}
          >
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
