"use client"

import { useSyncExternalStore } from "react"
import { Gauge } from "@suyalcinkaya/gauge"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

export default function OnboardingProgress({ progres }: { progres: number }) {
  const t = useTranslations("dashboard.onboarding")
  const theme = useTheme()
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const secondary =
    isMounted && theme.resolvedTheme === "dark" ? "#212121" : "#cfcfcf"

  return (
    <div className="flex flex-row items-center gap-4 px-0 sm:px-4">
      <span className="text-gray-500 dark:text-gray-400">{t("progress")}</span>
      <Gauge
        value={progres}
        size="xs"
        showAnimation={isMounted}
        primary="#16a34a"
        showValue
        secondary={secondary}
      />
    </div>
  )
}
