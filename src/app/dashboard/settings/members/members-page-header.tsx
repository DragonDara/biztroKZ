"use client"

import { Users } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"

export function MembersPageHeader({ actions }: { actions?: React.ReactNode }) {
  const t = useTranslations("dashboard.settings.members")

  return (
    <PageSubtitle>
      <PageSubtitle.Icon icon={Users} />
      <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
      <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
      {actions ? <PageSubtitle.Actions>{actions}</PageSubtitle.Actions> : null}
    </PageSubtitle>
  )
}
