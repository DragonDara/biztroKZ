"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"
import type { z } from "zod/v4"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { ImageField } from "@/components/dashboard/image-field"
import { MenuSyncDialog } from "@/components/dashboard/menu-sync-dialog"
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createMenuSection,
  removeMenuSectionCover,
  syncMenuSectionCover,
  updateMenuSection
} from "@/server/actions/item/mutations"
import { syncMenusAfterCatalogChange } from "@/server/actions/menu/sync"
import { ActionType, menuSectionSchema } from "@/lib/types/category"
import { ImageType } from "@/lib/types/media"

type MenuSectionInput = z.infer<typeof menuSectionSchema>
type EditableMenuSection = MenuSectionInput & {
  coverImage?: string | null
  coverImageAssetId?: string | null
}

export default function MenuSectionEdit({
  action,
  children,
  menuSection
}: {
  action: ActionType
  children: React.ReactNode
  menuSection?: EditableMenuSection
}) {
  const t = useTranslations("dashboard.menuItems.categories")
  const tCommon = useTranslations("dashboard.common")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [createdMenuSection, setCreatedMenuSection] =
    useState<EditableMenuSection | null>(null)
  const [coverImage, setCoverImage] = useState(menuSection?.coverImage ?? null)
  const [syncPrompt, setSyncPrompt] = useState(false)
  const [shouldFinishAfterSync, setShouldFinishAfterSync] = useState(false)
  const [rememberChoice, setRememberChoice] = useState(false)
  const activeMenuSection = createdMenuSection ?? menuSection
  const form = useForm<MenuSectionInput>({
    resolver: zodResolver(menuSectionSchema),
    defaultValues: {
      id: menuSection?.id,
      name: menuSection?.name ?? "",
      organizationId: menuSection?.organizationId
    }
  })

  const resetDialog = () => {
    setCreatedMenuSection(null)
    setCoverImage(menuSection?.coverImage ?? null)
    setSyncPrompt(false)
    setShouldFinishAfterSync(false)
    setRememberChoice(false)
    form.reset({
      id: menuSection?.id,
      name: menuSection?.name ?? "",
      organizationId: menuSection?.organizationId
    })
  }

  const finish = () => {
    setOpen(false)
    resetDialog()
    router.refresh()
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) resetDialog()
  }

  const handleSyncResult = (
    sync: { needsPublishedDecision: boolean },
    shouldFinish: boolean
  ) => {
    if (sync.needsPublishedDecision) {
      setShouldFinishAfterSync(shouldFinish)
      setSyncPrompt(true)
      return
    }

    if (shouldFinish) finish()
    else router.refresh()
  }

  const createAction = useAction(createMenuSection, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) toast.error(data.failure.reason)
      if (data?.success) {
        toast.success(t("menuSectionCreated"))
        setCreatedMenuSection(data.success)
        setCoverImage(data.success.coverImage)
        router.refresh()
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
        handleSyncResult(data.success.sync, true)
      }
      updateAction.reset()
    },
    onError: () => {
      toast.error(t("menuSectionUpdateError"))
      updateAction.reset()
    }
  })

  const coverSyncAction = useAction(syncMenuSectionCover, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) toast.error(data.failure.reason)
      if (data?.success) {
        setCoverImage(data.success.coverImage)
        toast.success(t("menuSectionCoverUpdated"))
        handleSyncResult(data.success.sync, false)
      }
      coverSyncAction.reset()
    },
    onError: () => {
      toast.error(t("menuSectionCoverUpdateError"))
      coverSyncAction.reset()
    }
  })

  const removeCoverAction = useAction(removeMenuSectionCover, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) toast.error(data.failure.reason)
      if (data?.success) {
        setCoverImage(null)
        toast.success(t("menuSectionCoverRemoved"))
        handleSyncResult(data.success.sync, false)
      }
      removeCoverAction.reset()
    },
    onError: () => {
      toast.error(t("menuSectionCoverRemoveError"))
      removeCoverAction.reset()
    }
  })

  const syncAction = useAction(syncMenusAfterCatalogChange, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) toast.error(data.failure.reason)
      if (data?.success) toast.success(t("menuSectionSynced"))
      syncAction.reset()
      setSyncPrompt(false)
      if (shouldFinishAfterSync) finish()
      else router.refresh()
    },
    onError: () => {
      toast.error(t("menuSectionSyncError"))
      syncAction.reset()
    }
  })

  const isSaving =
    createAction.status === "executing" || updateAction.status === "executing"
  const isUpdatingCover =
    coverSyncAction.status === "executing" ||
    removeCoverAction.status === "executing"

  const onSubmit = (data: MenuSectionInput) => {
    if (action === ActionType.CREATE) createAction.execute(data)
    else updateAction.execute(data)
  }

  const syncCover = () => {
    if (!activeMenuSection?.id || !activeMenuSection.organizationId) return
    coverSyncAction.execute({
      id: activeMenuSection.id,
      organizationId: activeMenuSection.organizationId
    })
  }

  const removeCover = () => {
    if (!activeMenuSection?.id || !activeMenuSection.organizationId) return
    removeCoverAction.execute({
      id: activeMenuSection.id,
      organizationId: activeMenuSection.organizationId
    })
  }

  const handleSyncChoice = (updatePublished: boolean) => {
    if (!activeMenuSection?.organizationId) return finish()
    syncAction.execute({
      organizationId: activeMenuSection.organizationId,
      updatePublished,
      rememberChoice
    })
  }

  const isCreateCoverStep =
    action === ActionType.CREATE && createdMenuSection !== null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("menuSectionDialogTitle")}</DialogTitle>
          <DialogDescription>
            {isCreateCoverStep
              ? t("menuSectionCoverStepDescription")
              : action === ActionType.CREATE
                ? t("menuSectionDialogCreate")
                : t("menuSectionDialogEdit")}
          </DialogDescription>
        </DialogHeader>

        {!isCreateCoverStep ? (
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
                <TextMorph>
                  {isSaving ? t("saving") : tCommon("save")}
                </TextMorph>
              </Button>
            </FieldGroup>
          </form>
        ) : null}

        {activeMenuSection?.id && activeMenuSection.organizationId ? (
          <Field>
            <div>
              <FieldLabel>{t("menuSectionCoverLabel")}</FieldLabel>
              <FieldDescription>
                {t("menuSectionCoverDescription")}
              </FieldDescription>
            </div>
            {coverImage ? (
              <ImageField
                organizationId={activeMenuSection.organizationId}
                src={coverImage}
                imageType={ImageType.MENU_SECTION_COVER}
                objectId={activeMenuSection.id}
                onUploadSuccess={syncCover}
                className="aspect-4/3 min-h-0"
              />
            ) : (
              <EmptyImageField
                organizationId={activeMenuSection.organizationId}
                imageType={ImageType.MENU_SECTION_COVER}
                objectId={activeMenuSection.id}
                onUploadSuccess={syncCover}
                className="aspect-4/3 min-h-0 py-6"
              />
            )}
            {coverImage ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingCover}
                  >
                    {isUpdatingCover ? <Loader /> : <Trash2 />}
                    {t("menuSectionCoverRemove")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("menuSectionCoverRemoveTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("menuSectionCoverRemoveDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={removeCover}>
                      {t("menuSectionCoverRemove")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </Field>
        ) : null}

        {isCreateCoverStep ? (
          <Button
            type="button"
            className="w-full"
            onClick={finish}
            disabled={isUpdatingCover}
          >
            {t("menuSectionDone")}
          </Button>
        ) : null}

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
