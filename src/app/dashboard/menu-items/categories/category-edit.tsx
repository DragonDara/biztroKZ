"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { createCategory, updateCategory } from "@/server/actions/item/mutations"
import type { getMenuSections } from "@/server/actions/item/queries"
import { syncMenusAfterCatalogChange } from "@/server/actions/menu/sync"
import { useIsMobile } from "@/hooks/use-mobile"
import { ActionType, categorySchema } from "@/lib/types/category"

export default function CategoryEdit({
  children,
  category,
  action,
  menuSections
}: {
  children?: React.ReactNode
  category?: z.infer<typeof categorySchema>
  action: ActionType
  menuSections: Awaited<ReturnType<typeof getMenuSections>>
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
              menuSections={menuSections}
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
          menuSections={menuSections}
          onClose={setOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

function CategoryEditForm({
  category,
  action,
  menuSections,
  onClose
}: {
  category?: z.infer<typeof categorySchema>
  action: ActionType
  menuSections: Awaited<ReturnType<typeof getMenuSections>>
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
      organizationId: category?.organizationId ?? undefined,
      menuSectionId: category?.menuSectionId ?? ""
    }
  })
  const posthog = usePostHog()
  const router = useRouter()
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
        router.refresh()
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
        router.refresh()
      } else if (data?.failure.reason) {
        toast.error(data?.failure.reason)
      }

      resetUpdate()
    },
    onError: () => {
      toast.error(t("updateError"))
      resetUpdate()
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
      resetSyncMenus()
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
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("nameLabel")}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t("namePlaceholder")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="menuSectionId"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="category-menu-section">
                {t("menuSectionLabel")}
              </FieldLabel>
              <Select
                value={field.value || "unassigned"}
                onValueChange={value =>
                  field.onChange(value === "unassigned" ? "" : value)
                }
              >
                <SelectTrigger id="category-menu-section" className="w-full">
                  <SelectValue placeholder={t("menuSectionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="unassigned">
                      {t("withoutMenuSection")}
                    </SelectItem>
                    {menuSections.map(menuSection => (
                      <SelectItem key={menuSection.id} value={menuSection.id}>
                        {menuSection.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>{t("menuSectionDescription")}</FieldDescription>
            </Field>
          )}
        />
        <Button
          type="submit"
          disabled={
            statusInsert === "executing" || statusUpdate === "executing"
          }
          className="w-full"
        >
          {(statusInsert === "executing" || statusUpdate === "executing") && (
            <Loader data-icon="inline-start" className="animate-spin" />
          )}
          <TextMorph>
            {statusInsert === "executing" || statusUpdate === "executing"
              ? t("saving")
              : tCommon("save")}
          </TextMorph>
        </Button>
      </FieldGroup>
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
