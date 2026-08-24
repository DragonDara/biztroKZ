"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { CirclePlus, Loader } from "lucide-react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { createMenu } from "@/server/actions/menu/mutations"
import { BasicPlanLimits } from "@/lib/types/plan"

export default function MenuCreate() {
  const t = useTranslations("dashboard.menus")
  const router = useRouter()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const { execute, status, reset } = useAction(createMenu, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        if (data.failure.code === BasicPlanLimits.MENU_LIMIT_REACHED) {
          setShowUpgrade(true)
          reset()
          return
        } else {
          toast.error(data.failure.reason)
          reset()
          return
        }
      }

      router.push(`/menu-editor/${data?.success?.id}`)
      reset()
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "menu-create" }
      })
      toast.error(t("createError"))
      reset()
    }
  })

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex h-[250px] w-full flex-col items-center justify-center
          gap-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-400
          dark:border-gray-800 dark:bg-gray-800/20 dark:text-gray-500"
        disabled={status === "executing"}
        onClick={() =>
          execute({
            name: t("newMenuDefaultName"),
            description: "",
            status: "DRAFT"
          })
        }
      >
        {status === "executing" ? (
          <Loader className="size-10 animate-spin" />
        ) : (
          <CirclePlus className="size-10" />
        )}
        {t("create")}
      </motion.button>

      <UpgradeDialog
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title={t("upgradeTitle")}
        description={t("upgradeDescription")}
      />
    </>
  )
}
