"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"

export function useMenuEditorUnsavedCopy() {
  const t = useTranslations("menuEditor.unsavedChanges")
  const tCommon = useTranslations("dashboard.common")

  const dismissButtonLabel = tCommon("cancel")
  const proceedLinkLabel = t("discardChanges")
  const editorLeaveMessage = t("editorLeave")
  const dataGridSaveMessage = t("dataGridSave")
  const dataGridWarning = t("dataGridWarning")

  return useMemo(
    () => ({
      editorLeave: {
        message: editorLeaveMessage,
        dismissButtonLabel,
        proceedLinkLabel
      },
      dataGridSave: {
        message: dataGridSaveMessage,
        dismissButtonLabel,
        proceedLinkLabel
      },
      dataGridWarning
    }),
    [
      dismissButtonLabel,
      proceedLinkLabel,
      editorLeaveMessage,
      dataGridSaveMessage,
      dataGridWarning
    ]
  )
}
