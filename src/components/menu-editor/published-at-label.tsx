"use client"

import { useLocale } from "next-intl"

export default function PublishedAtLabel({
  publishedAt
}: {
  publishedAt: number | null
}) {
  const locale = useLocale()

  if (!publishedAt) {
    return null
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(publishedAt)
}
