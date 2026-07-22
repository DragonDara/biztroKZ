"use client"

import toast from "react-hot-toast"
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
import { removeMember } from "@/server/actions/user/mutations"
import type { AuthMember } from "@/lib/auth"
import { cn } from "@/lib/utils"

export default function MemberDelete({
  member,
  open,
  setOpen
}: {
  member: AuthMember
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const t = useTranslations("dashboard.settings.members")
  const tCommon = useTranslations("dashboard.common")

  const { execute, reset } = useAction(removeMember, {
    onExecute: () => {
      toast.loading(t("deleting"))
    },
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.dismiss()
        toast.error(data.failure.reason)
      } else if (data?.success) {
        toast.dismiss()
        toast.success(t("deleted"))
      }
      reset()
    },
    onError: () => {
      toast.error(tCommon("genericError"))
      reset()
    }
  })

  const onDeleteMember = () => {
    execute({ id: member.id })
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
              onDeleteMember()
            }}
          >
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
