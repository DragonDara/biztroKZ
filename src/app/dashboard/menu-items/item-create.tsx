"use client"

import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { Loader, PlusCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { usePostHog } from "posthog-js/react"

import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { Button } from "@/components/ui/button"
import { createItem } from "@/server/actions/item/mutations"
import { appConfig } from "@/app/config"
import { BasicPlanLimits } from "@/lib/types/billing"
import { MenuItemStatus } from "@/lib/types/menu-item"

export default function ItemCreate() {
  const t = useTranslations("dashboard.menuItems.products")
  const [isPending, startTransition] = useTransition()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const router = useRouter()
  const posthog = usePostHog()

  const { execute, status, reset } = useAction(createItem, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        if (data.failure.code === BasicPlanLimits.ITEM_LIMIT_REACHED) {
          setShowUpgrade(true)
        } else {
          toast.error(data.failure.reason)
        }
        reset()
        return
      }

      if (data?.success) {
        posthog.capture("item_created", {
          item_id: data.success.id,
          organization_id: data.success.organizationId,
          category_id: data.success.categoryId,
          source: "dashboard"
        })
      }

      startTransition(() => {
        router.push(`/dashboard/menu-items/new/${data?.success?.id}`)
        reset()
      })
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "item-create" }
      })
      toast.error(t("createError"))
      reset()
    }
  })

  return (
    <>
      <Button
        className="ml-auto gap-2"
        disabled={status === "executing" || isPending}
        onClick={() =>
          execute({
            name: t("defaultName"),
            status: MenuItemStatus.DRAFT,
            description: "",
            variants: [
              {
                name: t("defaultVariant"),
                price: 0
              }
            ]
          })
        }
      >
        {status === "executing" || isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <PlusCircle className="size-4" />
        )}
        {t("newProduct")}
      </Button>

      <UpgradeDialog
        title={t("upgradeTitle")}
        description={t("upgradeDescription", { limit: appConfig.itemLimit })}
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
    </>
  )
}
