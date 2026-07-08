"use client"

import { useTranslations } from "next-intl"

export function useMenuEditorUnsavedCopy() {
  const t = useTranslations("menuEditor.unsavedChanges")
  const tCommon = useTranslations("dashboard.common")

  const dismissButtonLabel = tCommon("cancel")
  const proceedLinkLabel = t("discardChanges")

  return {
    editorLeave: {
      message: t("editorLeave"),
      dismissButtonLabel,
      proceedLinkLabel
    },
    dataGridSave: {
      message: t("dataGridSave"),
      dismissButtonLabel,
      proceedLinkLabel
    },
    dataGridWarning: t("dataGridWarning")
  }
}
