"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"
import type { z } from "zod/v4"

import { MenuSyncDialog } from "@/components/dashboard/menu-sync-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createMenuSection,
  updateMenuSection
} from "@/server/actions/item/mutations"
import { syncMenusAfterCatalogChange } from "@/server/actions/menu/sync"
import { ActionType, menuSectionSchema } from "@/lib/types/category"

type MenuSectionInput = z.infer<typeof menuSectionSchema>

export default function MenuSectionEdit({
  action,
  children,
  menuSection
}: {
  action: ActionType
  children: React.ReactNode
  menuSection?: MenuSectionInput
}) {
  const t = useTranslations("dashboard.menuItems.categories")
  const tCommon = useTranslations("dashboard.common")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [syncPrompt, setSyncPrompt] = useState(false)
  const [rememberChoice, setRememberChoice] = useState(false)
  const form = useForm<MenuSectionInput>({
    resolver: zodResolver(menuSectionSchema),
    defaultValues: {
      id: menuSection?.id,
      name: menuSection?.name ?? "",
      organizationId: menuSection?.organizationId
    }
  })

  const finish = () => {
    setOpen(false)
    router.refresh()
  }

  const createAction = useAction(createMenuSection, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) toast.error(data.failure.reason)
      if (data?.success) {
        toast.success(t("menuSectionCreated"))
        finish()
      }
      createAction.reset()
    },
    onError: () => {
      toast.error(t("menuSectionCreateError"))
      createAction.reset()
    }
  })

  const updateAction = useAction(updateMenuSection, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) toast.error(data.failure.reason)
      if (data?.success) {
        toast.success(t("menuSectionUpdated"))
        if (data.success.sync.needsPublishedDecision) setSyncPrompt(true)
        else finish()
      }
      updateAction.reset()
    },
    onError: () => {
      toast.error(t("menuSectionUpdateError"))
      updateAction.reset()
    }
  })

  const syncAction = useAction(syncMenusAfterCatalogChange, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) toast.error(data.failure.reason)
      if (data?.success) toast.success(t("menuSectionSynced"))
      syncAction.reset()
      setSyncPrompt(false)
      finish()
    },
    onError: () => {
      toast.error(t("menuSectionSyncError"))
      syncAction.reset()
    }
  })

  const isSaving =
    createAction.status === "executing" || updateAction.status === "executing"

  const onSubmit = (data: MenuSectionInput) => {
    if (action === ActionType.CREATE) createAction.execute(data)
    else updateAction.execute(data)
  }

  const handleSyncChoice = (updatePublished: boolean) => {
    if (!menuSection?.organizationId) return finish()
    if (!updatePublished && !rememberChoice) {
      setSyncPrompt(false)
      return finish()
    }
    syncAction.execute({
      organizationId: menuSection.organizationId,
      updatePublished,
      rememberChoice
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("menuSectionDialogTitle")}</DialogTitle>
          <DialogDescription>
            {action === ActionType.CREATE
              ? t("menuSectionDialogCreate")
              : t("menuSectionDialogEdit")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="menu-section-name">
                    {t("menuSectionNameLabel")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="menu-section-name"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("menuSectionNamePlaceholder")}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? <Loader data-icon="inline-start" /> : null}
              <TextMorph>{isSaving ? t("saving") : tCommon("save")}</TextMorph>
            </Button>
          </FieldGroup>
        </form>
        <MenuSyncDialog
          open={syncPrompt}
          onOpenChange={setSyncPrompt}
          rememberChoice={rememberChoice}
          onRememberChoiceChange={setRememberChoice}
          onCancel={() => handleSyncChoice(false)}
          onConfirm={() => handleSyncChoice(true)}
          isLoading={syncAction.status === "executing"}
          description={t("menuSectionSyncDescription")}
          checkboxId="remember-published-choice-menu-section"
        />
      </DialogContent>
    </Dialog>
  )
}
