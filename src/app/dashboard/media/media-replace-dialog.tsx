"use client"

import { useMemo } from "react"
import toast from "react-hot-toast"
import { Info } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { FileUploader } from "@/components/dashboard/file-uploader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerNested,
  DrawerTitle
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { ImageType } from "@/lib/types/media"

type MediaAsset = {
  id: string
  organizationId: string
  storageKey: string
  url: string
  type: string
  scope: string | null
  createdAt: Date
  updatedAt: Date
  usageCount: number
  usages: Array<{
    entityType: string
    entityId: string
    field: string | null
  }>
}

function resolveReplaceTarget(asset: MediaAsset): {
  imageType: ImageType
  objectId: string
  limitDimension: number
} | null {
  switch (asset.scope) {
    case "ORG_LOGO":
      return {
        imageType: ImageType.LOGO,
        objectId: ImageType.LOGO,
        limitDimension: 500
      }
    case "ORG_BANNER":
      return {
        imageType: ImageType.BANNER,
        objectId: ImageType.BANNER,
        limitDimension: 1200
      }
    case "MENU_ITEM_IMAGE": {
      const usage = asset.usages.find(
        u =>
          u.entityType === "MENU_ITEM" &&
          u.field === "image" &&
          typeof u.entityId === "string" &&
          u.entityId.length > 0
      )

      if (!usage) return null

      return {
        imageType: ImageType.MENUITEM,
        objectId: usage.entityId,
        limitDimension: 1200
      }
    }
    default:
      return null
  }
}

export function MediaReplaceDialog({
  asset,
  open,
  onOpenChange
}: {
  asset: MediaAsset
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const t = useTranslations("dashboard.settings.media")

  const target = useMemo(() => resolveReplaceTarget(asset), [asset])

  const replaceContent = target ? (
    <FileUploader
      organizationId={asset.organizationId}
      imageType={target.imageType}
      objectId={target.objectId}
      limitDimension={target.limitDimension}
      onUploadSuccess={() => {
        toast.success(t("replaceSuccess"))
        onOpenChange(false)
        router.refresh()
      }}
      onUploadError={() => {
        toast.error(t("replaceError"))
      }}
    />
  ) : (
    <Alert variant="information">
      <Info className="size-4" />
      <AlertTitle>{t("replaceUnavailableTitle")}</AlertTitle>
      <AlertDescription>{t("replaceUnavailableDescription")}</AlertDescription>
    </Alert>
  )

  if (isMobile) {
    return (
      <DrawerNested open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>{t("replaceTitle")}</DrawerTitle>
            <DrawerDescription>{t("replaceDescription")}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">{replaceContent}</div>
        </DrawerContent>
      </DrawerNested>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("replaceTitle")}</DialogTitle>
          <DialogDescription>{t("replaceDescription")}</DialogDescription>
        </DialogHeader>

        {replaceContent}
      </DialogContent>
    </Dialog>
  )
}
