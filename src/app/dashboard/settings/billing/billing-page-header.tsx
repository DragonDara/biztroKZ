"use client"

import { CreditCard } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"

export function BillingPageHeader() {
  const t = useTranslations("dashboard.settings.billing")

  return (
    <PageSubtitle>
      <PageSubtitle.Icon icon={CreditCard} />
      <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
      <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
    </PageSubtitle>
  )
}
