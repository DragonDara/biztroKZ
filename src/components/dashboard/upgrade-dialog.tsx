"use client"

import { useCallback, useState } from "react"
import { Crown } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { RainbowButton } from "@/components/magicui/rainbow-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface UpgradeDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
}

export function UpgradeDialog({
  open,
  onClose,
  title,
  description
}: UpgradeDialogProps) {
  const t = useTranslations("dashboard.upgrade")
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-linear-to-t from-indigo-300 via-transparent to-transparent
          dark:from-indigo-500"
      >
        <DialogHeader className="flex items-center gap-4 pb-6">
          <div
            className="rounded-full bg-linear-to-b from-amber-100 to-transparent
              p-2.5 dark:from-transparent dark:to-amber-900/40"
          >
            <div
              className="rounded-full border border-amber-200 bg-amber-50 p-3
                text-amber-400 shadow-xs dark:border-amber-800
                dark:bg-amber-900/50 dark:text-amber-500"
            >
              <Crown className="size-8" />
            </div>
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center dark:text-indigo-300">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-4 sm:flex-col">
          <RainbowButton
            onClick={() => router.push("/dashboard/settings/billing")}
          >
            {t("cta")}
          </RainbowButton>
          <Button
            variant="link"
            onClick={onClose}
            className="dark:text-indigo-300"
          >
            {t("stayFree")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useProGuard(
  isPro: boolean,
  opts?: { title?: string; description?: string }
) {
  const t = useTranslations("dashboard.upgrade")
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])

  const guard = useCallback(
    (action: () => void) => {
      if (isPro) {
        action()
        return true
      }
      setOpen(true)
      return false
    },
    [isPro]
  )

  const dialog = (
    <UpgradeDialog
      open={open}
      onClose={onClose}
      title={opts?.title ?? t("defaultTitle")}
      description={opts?.description ?? t("defaultDescription")}
    />
  )

  return { guard, openDialog: () => setOpen(true), dialog }
}

export function ProGuard({
  isPro,
  children,
  title,
  description
}: {
  isPro: boolean
  children: React.ReactNode
  title?: string
  description?: string
}) {
  const t = useTranslations("dashboard.upgrade")
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])

  if (isPro) return <>{children}</>

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClickCapture={event => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(true)
        }}
        onKeyDownCapture={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            event.stopPropagation()
            setOpen(true)
          }
        }}
      >
        {children}
      </div>
      <UpgradeDialog
        open={open}
        onClose={onClose}
        title={title ?? t("defaultTitle")}
        description={description ?? t("defaultDescription")}
      />
    </>
  )
}
