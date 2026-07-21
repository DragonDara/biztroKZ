"use client"

import { useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface MenuSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rememberChoice: boolean
  onRememberChoiceChange: (checked: boolean) => void
  onCancel: () => void
  onConfirm: () => void
  isLoading?: boolean
  description?: string
  checkboxId?: string
}

export function MenuSyncDialog({
  open,
  onOpenChange,
  rememberChoice,
  onRememberChoiceChange,
  onCancel,
  onConfirm,
  isLoading = false,
  description,
  checkboxId = "remember-published-choice"
}: MenuSyncDialogProps) {
  const t = useTranslations("dashboard.menuSync")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? t("defaultDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-2">
          <Checkbox
            id={checkboxId}
            checked={rememberChoice}
            onCheckedChange={checked =>
              onRememberChoiceChange(checked === true)
            }
          />
          <label htmlFor={checkboxId} className="text-muted-foreground text-sm">
            {t("remember")}
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {t("notNow")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t("updating") : t("update")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
