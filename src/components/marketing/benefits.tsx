"use client"

import type { JSX } from "react"
import {
  BadgeCheck,
  Gem,
  Group,
  Handshake,
  QrCodeIcon,
  RefreshCcw,
  type LucideIcon
} from "lucide-react"
import { useTranslations } from "next-intl"

import TitleSection from "@/components/marketing/title-section"
import { Badge } from "@/components/ui/badge"

const BENEFIT_KEYS = [
  "reach",
  "update",
  "brand",
  "flexible",
  "promote",
  "noCommitment"
] as const

const BENEFIT_ICONS: Record<(typeof BENEFIT_KEYS)[number], LucideIcon> = {
  reach: BadgeCheck,
  update: RefreshCcw,
  brand: QrCodeIcon,
  flexible: Group,
  promote: Gem,
  noCommitment: Handshake
}

const BENEFIT_SOON: Partial<Record<(typeof BENEFIT_KEYS)[number], boolean>> = {
  promote: true
}

export default function Benefits() {
  const t = useTranslations("marketing.benefits")

  return (
    <section id="benefits" className="relative pt-20 pb-28 sm:py-32">
      <div
        className="absolute inset-0 h-full w-full items-center px-5 py-24
          dark:hidden"
        style={{
          background: `
          radial-gradient(ellipse 120% 80% at 70% 20%, oklch(92.2% 0.005 34.3 / 0.3), transparent 50%),
          radial-gradient(ellipse 100% 60% at 30% 10%, oklch(86.8% 0.007 39.5 / 0.2), transparent 60%),
          radial-gradient(ellipse 90% 70% at 50% 0%, oklch(71.4% 0.014 41.2 / 0.15), transparent 65%),
          oklch(96% 0.002 17.2)
        `
        }}
      />
      <div className="relative z-10">
        <TitleSection
          align="left"
          eyebrow={t("eyebrow")}
          title={t("title")}
          className="mx-auto mb-8 px-4 sm:mb-12 sm:px-6 lg:mb-16 lg:px-8"
        />
        <div
          className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-8 px-4
            sm:grid-cols-3 sm:gap-12 sm:px-6 lg:gap-16 lg:px-8"
        >
          {BENEFIT_KEYS.map(key => (
            <BenefitItem
              key={key}
              Icon={BENEFIT_ICONS[key]}
              title={t(`items.${key}.title`)}
              description={t(`items.${key}.description`)}
              soon={BENEFIT_SOON[key] ?? false}
              soonLabel={t("soon")}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const BenefitItem = ({
  Icon,
  title,
  description,
  soon,
  soonLabel
}: {
  Icon: LucideIcon
  title: string
  description: string
  soon: boolean
  soonLabel: string
}): JSX.Element => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className="flex size-10 items-center justify-center rounded-lg border
            border-taupe-200 bg-taupe-50 dark:border-taupe-700/50
            dark:bg-taupe-800/40"
        >
          <Icon className="size-5 text-taupe-700 dark:text-taupe-300" />
        </div>
        {soon && (
          <Badge
            variant="outline"
            className="border-taupe-200 bg-taupe-100 tracking-wide
              text-taupe-600 uppercase dark:border-taupe-700/50
              dark:bg-taupe-800/20 dark:text-taupe-400"
          >
            {soonLabel}
          </Badge>
        )}
      </div>
      <p className="text-taupe-700 dark:text-taupe-300">
        <span className="font-semibold text-taupe-950 dark:text-taupe-100">
          {title}.{" "}
        </span>
        {description}
      </p>
    </div>
  )
}
