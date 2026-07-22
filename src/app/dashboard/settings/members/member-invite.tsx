"use client"

import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Sentry from "@sentry/nextjs"
import { Loader, UserPlus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { TextMorph } from "torph/react"
import { z } from "zod/v4"

import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { inviteMember } from "@/server/actions/user/mutations"

export default function MemberInvite({ isPro }: { isPro: boolean }) {
  const t = useTranslations("dashboard.settings.members")
  const [open, setOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const emailSchema = useMemo(
    () =>
      z.object({
        email: z.email({
          error: t("emailInvalid")
        })
      }),
    [t]
  )

  const { execute, status, reset } = useAction(inviteMember, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
        return
      }
      toast.success(t("inviteSent"))
      setOpen(false)
      reset()
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "member-invite" }
      })
      toast.error(t("inviteError"))
    }
  })

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" }
  })

  const onSubmit = async (data: z.infer<typeof emailSchema>) => {
    if (!isPro) {
      setUpgradeOpen(true)
      return
    }
    await execute(data)
  }

  const inviteButton = (
    <Button className="gap-2">
      <UserPlus className="size-4" />
      {t("invite")}
    </Button>
  )

  return (
    <div>
      {isPro ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{inviteButton}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("inviteTitle")}</DialogTitle>
              <DialogDescription>{t("inviteDescription")}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-4 space-y-6"
              >
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className="mb-4"
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={status === "executing"}>
                    {status === "executing" ? (
                      <Loader className="mr-2 size-4 animate-spin" />
                    ) : null}
                    <TextMorph>
                      {status === "executing" ? t("sending") : t("sendInvite")}
                    </TextMorph>
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
          <DialogTrigger asChild>{inviteButton}</DialogTrigger>
          <UpgradeDialog
            open={upgradeOpen}
            onClose={() => setUpgradeOpen(false)}
            title={t("upgradeTitle")}
            description={t("upgradeDescription")}
          />
        </Dialog>
      )}
    </div>
  )
}
