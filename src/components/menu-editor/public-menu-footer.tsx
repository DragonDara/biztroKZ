"use client"

import { useTranslations } from "next-intl"

import PublishedAtLabel from "@/components/menu-editor/published-at-label"

export function PublicMenuLastUpdated({
  publishedAt
}: {
  publishedAt: number | null
}) {
  const t = useTranslations("publicMenu")

  return (
    <>
      {t("lastUpdated")} <PublishedAtLabel publishedAt={publishedAt} />
    </>
  )
}

export function PublicMenuPoweredBy() {
  const t = useTranslations("publicMenu")

  return <em className="hidden not-italic sm:inline">{t("poweredBy")}</em>
}
