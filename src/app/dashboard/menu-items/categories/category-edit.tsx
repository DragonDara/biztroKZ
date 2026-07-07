"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { usePostHog } from "posthog-js/react"
import { TextMorph } from "torph/react"
import { type z } from "zod/v4"

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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createCategory, updateCategory } from "@/server/actions/item/mutations"
import { syncMenusAfterCatalogChange } from "@/server/actions/menu/sync"
import { useIsMobile } from "@/hooks/use-mobile"
import { ActionType, categorySchema } from "@/lib/types/category"

export default function CategoryEdit({
  children,
  category,
  action
}: {
  children?: React.ReactNode
  category?: z.infer<typeof categorySchema>
  action: ActionType
}) {
  const isMobile = useIsMobile()
  const t = useTranslations("dashboard.menuItems.categories")
  const [open, setOpen] = useState(false)

  const dialogDescription =
    action === ActionType.CREATE ? t("dialogCreate") : t("dialogEdit")

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{t("dialogTitle")}</DrawerTitle>
            <DrawerDescription>{dialogDescription}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <CategoryEditForm
              category={category}
              action={action}
              onClose={setOpen}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <CategoryEditForm
          category={category}
          action={action}
          onClose={setOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

function CategoryEditForm({
  category,
  action,
  onClose
}: {
  category?: z.infer<typeof categorySchema>
  action: ActionType
  onClose: (open: boolean) => void
}) {
  const t = useTranslations("dashboard.menuItems.categories")
  const tCommon = useTranslations("dashboard.common")
  const tProducts = useTranslations("dashboard.menuItems.products")

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: category?.id ?? undefined,
      name: category?.name ?? "",
      organizationId: category?.organizationId ?? undefined
    }
  })
  const posthog = usePostHog()
  const [syncPrompt, setSyncPrompt] = useState({
    open: false,
    organizationId: category?.organizationId ?? "",
    rememberChoice: false
  })

  const {
    execute: executeInsert,
    status: statusInsert,
    reset: resetInsert
  } = useAction(createCategory, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(t("created"))

        // Track category creation
        posthog.capture("category_created", {
          category_id: data.success.id,
          organization_id: data.success.organizationId,
          source: "dashboard"
        })

        onClose(false)
      } else if (data?.failure.reason) {
        toast.error(data?.failure.reason)
      }

      resetInsert()
    },
    onError: () => {
      toast.error(t("createError"))
      resetInsert()
    }
  })

  const {
    execute: executeUpdate,
    status: statusUpdate,
    reset: resetUpdate
  } = useAction(updateCategory, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        const syncMeta = data.success.sync
        toast.success(t("updated"))

        if (syncMeta?.publishedUpdated) {
          toast.success(tProducts("publishedMenuUpdated"))
        }

        if (syncMeta?.needsPublishedDecision) {
          setSyncPrompt(prev => ({
            ...prev,
            open: true,
            rememberChoice: false,
            organizationId: data.success.category.organizationId ?? ""
          }))
        } else {
          onClose(false)
        }
      } else if (data?.failure.reason) {
        toast.error(data?.failure.reason)
      }

      resetUpdate()
    },
    onError: () => {
      toast.error(t("updateError"))
    }
  })

  const {
    execute: executeSyncMenus,
    status: statusSyncMenus,
    reset: resetSyncMenus
  } = useAction(syncMenusAfterCatalogChange, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(tProducts("menuUpdated"))
      } else if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      }
      resetSyncMenus()
      setSyncPrompt(prev => ({ ...prev, open: false, rememberChoice: false }))
    },
    onError: () => {
      toast.error(tProducts("menuUpdateError"))
      setSyncPrompt(prev => ({ ...prev, open: false }))
    }
  })

  const onSubmit = (data: z.infer<typeof categorySchema>) => {
    if (action === ActionType.CREATE) {
      executeInsert(data)
    } else if (action === ActionType.UPDATE) {
      executeUpdate(data)
    }
  }

  const handleSyncChoice = (updatePublished: boolean) => {
    if (!syncPrompt.organizationId) {
      setSyncPrompt(prev => ({ ...prev, open: false }))
      return
    }

    if (!syncPrompt.rememberChoice && updatePublished === false) {
      setSyncPrompt(prev => ({ ...prev, open: false }))
      return
    }

    executeSyncMenus({
      organizationId: syncPrompt.organizationId,
      updatePublished,
      rememberChoice: syncPrompt.rememberChoice
    })
    onClose(false)
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("nameLabel")}</FieldLabel>
            <Input {...field} placeholder={t("namePlaceholder")} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button
        disabled={statusInsert === "executing" || statusUpdate === "executing"}
        onClick={form.handleSubmit(onSubmit)}
        className="w-full"
      >
        {(statusInsert === "executing" || statusUpdate === "executing") && (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        )}
        <TextMorph>
          {statusInsert === "executing" || statusUpdate === "executing"
            ? t("saving")
            : tCommon("save")}
        </TextMorph>
      </Button>
      <MenuSyncDialog
        open={syncPrompt.open}
        onOpenChange={open =>
          setSyncPrompt(prev => ({ ...prev, open, rememberChoice: false }))
        }
        rememberChoice={syncPrompt.rememberChoice}
        onRememberChoiceChange={checked =>
          setSyncPrompt(prev => ({ ...prev, rememberChoice: checked }))
        }
        onCancel={() => handleSyncChoice(false)}
        onConfirm={() => handleSyncChoice(true)}
        isLoading={statusSyncMenus === "executing"}
        description={t("syncDescription")}
        checkboxId="remember-published-choice-category"
      />
    </form>
  )
}
