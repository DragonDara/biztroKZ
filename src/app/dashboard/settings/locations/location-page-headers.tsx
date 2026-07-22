"use client"

import { Clock, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"

export function LocationContactHeader() {
  const t = useTranslations("dashboard.settings.location")

  return (
    <PageSubtitle>
      <PageSubtitle.Icon icon={MapPin} />
      <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
      <PageSubtitle.Description>
        {t("contactDescription")}
      </PageSubtitle.Description>
    </PageSubtitle>
  )
}

export function LocationHoursHeader() {
  const t = useTranslations("dashboard.settings.location")

  return (
    <PageSubtitle>
      <PageSubtitle.Icon icon={Clock} />
      <PageSubtitle.Title>{t("hoursTitle")}</PageSubtitle.Title>
      <PageSubtitle.Description>
        {t("hoursDescription")}
      </PageSubtitle.Description>
    </PageSubtitle>
  )
}
