"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { deleteOrganization } from "@/server/actions/organization/mutations"
import { cn } from "@/lib/utils"

const CONFIRMATION_WORD = "ELIMINAR"

function OrganizationDelete({ organizationId }: { organizationId: string }) {
  const router = useRouter()
  const t = useTranslations("dashboard.settings.deleteOrganization")
  const tCommon = useTranslations("dashboard.common")
  const [confirmation, setConfirmation] = useState("")

  const hasConfirmed = confirmation.trim().toUpperCase() === CONFIRMATION_WORD

  const { execute, reset } = useAction(deleteOrganization, {
    onExecute: () => {
      toast(t("deleting"), { icon: "🗑️", duration: 2000 })
    },
    onSuccess: ({ data }) => {
      toast.dismiss()
      if (data?.failure) {
        toast.error(data.failure.reason ?? t("deleteError"))
      } else {
        router.push("/")
        reset()
      }
    },
    onError: () => {
      toast.error(t("deleteError"))
      reset()
    }
  })

  const handleDelete = () => {
    if (!hasConfirmed) {
      return
    }

    execute({
      id: organizationId,
      confirmation
    })
  }

  return (
    <>
      <Separator className="my-8" />
      <AlertDialog>
        <Card className="border-destructive/50 border bg-transparent">
          <CardHeader>
            <CardTitle className="text-base text-red-500 dark:text-red-400">
              {t("title")}
            </CardTitle>
          </CardHeader>
          <CardContent
            className="flex flex-col items-start justify-center gap-x-8 gap-y-4
              sm:flex-row sm:items-center"
          >
            <p className="text-gray-500">
              {t("description")}{" "}
              <span className="text-red-500 dark:text-red-400">
                {t("irreversible")}
              </span>
            </p>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                {t("title")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col gap-8">
                    <div>
                      {t("confirmDescription")}{" "}
                      <Link
                        href="/dashboard/settings/billing"
                        prefetch={false}
                        className="text-blue-600 underline underline-offset-2
                          hover:text-blue-800"
                      >
                        {t("cancelSubscription")}
                      </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-muted-foreground text-xs">
                        {t("confirmHint", { word: CONFIRMATION_WORD })}
                      </p>
                      <Input
                        placeholder={CONFIRMATION_WORD}
                        value={confirmation}
                        onChange={event => setConfirmation(event.target.value)}
                        aria-label={t("confirmAria")}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter
                className="flex flex-col gap-2 sm:flex-row sm:justify-end
                  sm:gap-4"
              >
                <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  disabled={!hasConfirmed}
                  onClick={handleDelete}
                  className={cn(buttonVariants({ variant: "destructive" }))}
                >
                  {t("title")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </CardContent>
        </Card>
      </AlertDialog>
    </>
  )
}
export default OrganizationDelete
