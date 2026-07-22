"use client"

import { Images } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"

export function MediaPageHeader({
  mediaCount,
  isPro,
  mediaLimit
}: {
  mediaCount: number
  isPro: boolean
  mediaLimit: number
}) {
  const t = useTranslations("dashboard.settings.media")

  return (
    <PageSubtitle className="px-6 py-4">
      <PageSubtitle.Icon icon={Images} />
      <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
      <PageSubtitle.Description>
        {isPro
          ? t("imageCount", { count: mediaCount })
          : t("imageCountLimit", { count: mediaCount, limit: mediaLimit })}
      </PageSubtitle.Description>
    </PageSubtitle>
  )
}
