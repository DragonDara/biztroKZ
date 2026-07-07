"use client"

import {
  Calendar,
  FileType,
  Image as ImageIcon,
  ImageUp,
  Ruler
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

type MediaAsset = {
  id: string
  storageKey: string
  url: string
  type: string
  scope: string | null
  width: number | null
  height: number | null
  bytes: number | null
  contentType: string | null
  createdAt: Date
  updatedAt: Date
  usageCount: number
  usages: Array<{
    entityType: string
    entityId: string
    field: string | null
  }>
}

export function MediaDetailsDialog({
  asset,
  open,
  onOpenChange,
  onReplace
}: {
  asset: MediaAsset
  open: boolean
  onOpenChange: (open: boolean) => void
  onReplace?: () => void
}) {
  const isMobile = useIsMobile()
  const t = useTranslations("dashboard.settings.media")
  const locale = useLocale()

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "N/A"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const formatDate = (date: Date) => {
    const localeTag =
      locale === "es" ? "es-MX" : locale === "ru" ? "ru-RU" : "en-US"

    return new Intl.DateTimeFormat(localeTag, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date))
  }

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "MENU_ITEM":
        return t("entityMenuItem")
      case "ORGANIZATION":
        return t("entityOrganization")
      case "PROMO":
        return t("entityPromo")
      default:
        return entityType
    }
  }

  const getScopeLabel = (scope: string | null) => {
    if (!scope) return t("scopeOther")
    switch (scope) {
      case "MENU_ITEM_IMAGE":
        return t("scopeMenuItemImage")
      case "ORG_LOGO":
        return t("scopeOrgLogo")
      case "ORG_BANNER":
        return t("scopeOrgBanner")
      case "PROMO":
        return t("scopePromo")
      case "OTHER":
        return t("scopeOther")
      default:
        return scope
    }
  }

  const detailsContent = (
    <div className="space-y-6">
      <div
        className="bg-muted relative aspect-video overflow-hidden rounded-lg
          border"
      >
        <Image
          src={asset.url}
          alt={t("previewAlt")}
          fill
          sizes="(max-width: 768px) 100vw, 32rem"
          className="object-contain"
          unoptimized
        />
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <FileType className="text-muted-foreground size-4" />
          <div>
            <p className="text-sm font-medium">{t("type")}</p>
            <p className="text-muted-foreground text-sm">
              {getScopeLabel(asset.scope)}
            </p>
          </div>
        </div>

        {asset.width && asset.height && (
          <div className="flex items-center gap-3">
            <Ruler className="text-muted-foreground size-4" />
            <div>
              <p className="text-sm font-medium">{t("dimensions")}</p>
              <p className="text-muted-foreground text-sm">
                {t("pixels", { width: asset.width, height: asset.height })}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <ImageIcon className="text-muted-foreground size-4" />
          <div>
            <p className="text-sm font-medium">{t("size")}</p>
            <p className="text-muted-foreground text-sm">
              {formatBytes(asset.bytes)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="text-muted-foreground size-4" />
          <div>
            <p className="text-sm font-medium">{t("uploaded")}</p>
            <p className="text-muted-foreground text-sm">
              {formatDate(asset.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">
          {t("usedIn", { count: asset.usageCount })}
        </h3>
        {asset.usages.length > 0 ? (
          <div className="space-y-2">
            {asset.usages.map((usage, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border
                  p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getEntityTypeLabel(usage.entityType)}
                  </Badge>
                  {usage.field && (
                    <span className="text-muted-foreground text-sm">
                      {usage.field}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t("notUsed")}</p>
        )}
      </div>
    </div>
  )

  const replaceButton = onReplace ? (
    <Button size="sm" variant="secondary" onClick={onReplace}>
      <ImageUp className="mr-2 size-4" />
      {t("replace")}
    </Button>
  ) : null

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="max-h-[85vh] space-y-4 overflow-y-auto px-4 pb-6"
        >
          <DrawerTitle>{t("detailsTitle")}</DrawerTitle>

          <div>{detailsContent}</div>
          {replaceButton}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <DialogHeader>
            <DialogTitle>{t("detailsTitle")}</DialogTitle>
          </DialogHeader>
        </div>
        {detailsContent}
        {replaceButton}
      </DialogContent>
    </Dialog>
  )
}
