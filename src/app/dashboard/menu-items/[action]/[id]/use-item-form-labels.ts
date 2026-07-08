"use client"

import { useCallback, useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"

import { MenuItemStatus } from "@/lib/types/menu-item"

export function useItemFormLabels(action: string) {
  const t = useTranslations("dashboard.menuItems.form")
  const tProducts = useTranslations("dashboard.menuItems.products")
  const tCommon = useTranslations("dashboard.common")
  const appLocale = useLocale()

  const languageNames = useMemo(
    () => new Intl.DisplayNames([appLocale], { type: "language" }),
    [appLocale]
  )

  const getLocaleLabel = useCallback(
    (locale?: string | null) => {
      if (!locale) {
        return ""
      }

      return languageNames.of(locale) ?? locale
    },
    [languageNames]
  )

  const getMenuItemStatusMeta = useCallback(
    (status: MenuItemStatus) => {
      switch (status) {
        case MenuItemStatus.ACTIVE:
          return {
            label: tProducts("statusActive"),
            variant: "green" as const,
            description: t("statusActiveDescription")
          }
        case MenuItemStatus.ARCHIVED:
          return {
            label: tProducts("statusArchived"),
            variant: "secondary" as const,
            description: t("statusArchivedDescription")
          }
        case MenuItemStatus.DRAFT:
        default:
          return {
            label: tProducts("statusDraft"),
            variant: "violet" as const,
            description: t("statusDraftDescription")
          }
      }
    },
    [t, tProducts]
  )

  const title = action === "new" ? t("createTitle") : t("editTitle")

  return {
    t,
    tProducts,
    tCommon,
    getLocaleLabel,
    getMenuItemStatusMeta,
    title
  }
}
