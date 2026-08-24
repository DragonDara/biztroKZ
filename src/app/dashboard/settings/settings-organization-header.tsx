"use client"

import { Store } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"

export function SettingsOrganizationHeader() {
  const t = useTranslations("dashboard.settings.organization")

  return (
    <div>
      <PageSubtitle>
        <PageSubtitle.Icon icon={Store} />
        <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
        <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
      </PageSubtitle>
    </div>
  )
}
