"use client"

import type { CSSProperties } from "react"
import { Rocket, ShoppingBag, Store } from "lucide-react"
import { useTranslations } from "next-intl"

import Features from "@/components/flare-ui/features-horizontal"
import { HowItWorksQr } from "@/components/marketing/how-it-works-qr"
import TitleSection from "@/components/marketing/title-section"

export default function Component() {
  const t = useTranslations("marketing.howItWorks")

  const data = [
    {
      id: 1,
      title: t("steps.setup.title"),
      content: t("steps.setup.content"),
      image: "/configuration.png",
      icon: <Store className="size-6" />
    },
    {
      id: 2,
      title: t("steps.products.title"),
      content: t("steps.products.content"),
      image: "/products.png",
      icon: <ShoppingBag className="size-6" />
    },
    {
      id: 3,
      title: t("steps.publish.title"),
      content: t("steps.publish.content"),
      image: "/editor.png",
      icon: <Rocket className="size-6" />
    }
  ]

  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl px-4 pt-20 pb-8 sm:px-6 sm:py-32 sm:pb-28
        lg:px-8"
      style={{ "--primary": "oklch(64.6% 0.222 41.116)" } as CSSProperties}
    >
      <TitleSection
        eyebrow={t("eyebrow")}
        title={t("title")}
        className="mb-8"
      />
      <Features collapseDelay={6000} data={data} linePosition="bottom" />
      <div
        className="mx-auto mt-0 grid max-w-6xl grid-cols-1 gap-8 px-4 sm:mt-28
          sm:grid-cols-2 sm:px-0"
      >
        <div>
          <h3
            className="font-display mb-4 text-lg font-semibold text-taupe-950
              sm:text-2xl lg:text-3xl dark:text-taupe-50"
          >
            {t("qr.title")}
          </h3>
          <div
            className="flex flex-col gap-3 text-taupe-700 sm:text-lg
              dark:text-taupe-300"
          >
            <p>{t("qr.p1")}</p>
            <p>
              {t("qr.p2")}{" "}
              <span className="text-taupe-950 dark:text-taupe-50">
                {t("qr.p2Highlight")}
              </span>{" "}
              {t("qr.p2Suffix")}
            </p>
            <p>{t("qr.p3")}</p>
          </div>
        </div>
        <HowItWorksQr />
      </div>
    </section>
  )
}
