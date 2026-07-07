"use client"

import { Store } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { SubscriptionStatusBadge } from "@/components/dashboard/subscription-status-badge"
import { type SubscriptionStatus } from "@/lib/types/billing"

export function SettingsOrganizationHeader({
  status
}: {
  status: SubscriptionStatus
}) {
  const t = useTranslations("dashboard.settings.organization")

  return (
    <div className="flex items-center justify-between">
      <PageSubtitle>
        <PageSubtitle.Icon icon={Store} />
        <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
        <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
      </PageSubtitle>
      <SubscriptionStatusBadge status={status} />
    </div>
  )
}
