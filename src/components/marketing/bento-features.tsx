"use client"

import { useMemo } from "react"
import { QRCode } from "react-qrcode-logo"
import { MousePointerClick, QrCodeIcon, SwatchBook } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { BentoCard, BentoGrid } from "@/components/flare-ui/bento-grid"
import GradientBlur from "@/components/flare-ui/gradient-blur"
import TitleSection from "@/components/marketing/title-section"
import { Ripple } from "@/components/ui/ripple"

export default function FeaturesBento() {
  const t = useTranslations("marketing.bento")

  const features = useMemo(
    () => [
      {
        Icon: SwatchBook,
        name: t("brand.name"),
        description: t("brand.description"),
        cta: t("brand.cta"),
        background: (
          <div className="absolute inset-0 origin-top">
            <Image
              src="/handheld-menu.png"
              alt={t("brand.imageAlt")}
              className="w-full translate-y-[-8%] transition-all duration-300
                ease-out group-hover:scale-105 sm:h-full sm:w-full
                sm:translate-y-0 sm:object-contain sm:object-bottom"
              width={600}
              height={600}
            />
            <GradientBlur className="inset-x-0 bottom-0 h-2/3 sm:h-1/3" />
          </div>
        ),
        className:
          "sm:row-start-1 sm:row-end-4 sm:col-start-1 sm:col-end-2 bg-orange-600 dark:bg-orange-600 dark:text-orange-50 text-orange-50"
      },
      {
        Icon: MousePointerClick,
        name: t("editor.name"),
        description: t("editor.description"),
        href: undefined,
        cta: t("editor.cta"),
        background: (
          <div
            className="absolute inset-x-0 top-1/3 flex items-start
              justify-center py-2 transition-all duration-300 ease-out
              group-hover:-translate-y-1 group-hover:scale-95 sm:inset-auto
              sm:top-4 sm:right-8"
          >
            <div className="relative flex items-center justify-center">
              <span
                className="absolute inline-flex h-8 w-22 rounded-full
                  bg-taupe-400 group-hover:animate-ping"
              ></span>
              <button
                className="relative inline-flex rounded-full bg-green-600 px-4
                  py-2 font-medium text-green-50 shadow-lg shadow-green-600/30"
              >
                {t("publishButton")}
              </button>
            </div>
          </div>
        ),
        className:
          "sm:col-start-2 sm:col-end-3 sm:row-start-1 sm:row-end-2 text-taupe-50 bg-taupe-950 dark:bg-taupe-900"
      },
      {
        Icon: QrCodeIcon,
        name: t("qr.name"),
        description: t("qr.description"),
        href: undefined,
        cta: t("qr.cta"),
        background: (
          <>
            <div
              className="absolute inset-0 -top-30 flex origin-top items-center
                justify-center pt-8 transition-all duration-300 ease-out
                group-hover:scale-95"
            >
              <div
                className="overflow-hidden rounded-lg shadow-xl
                  shadow-taupe-900/50"
              >
                <div className="z-10">
                  <QRCode
                    value="https://biztro.co"
                    logoImage="/logo-bistro.svg"
                    removeQrCodeBehindLogo
                    ecLevel="Q"
                    size={128}
                  />
                </div>
              </div>
            </div>
            <Ripple
              numCircles={3}
              mainCircleSize={210}
              className="bottom-1/2"
            />
          </>
        ),
        className:
          "sm:col-start-2 sm:col-end-3 sm:row-start-2 sm:row-end-4 bg-taupe-200 dark:bg-taupe-700 dark:text-taupe-50 text-taupe-950"
      }
    ],
    [t]
  )

  return (
    <>
      <section className="mx-auto mt-0 max-w-6xl px-4 sm:px-6 sm:px-8">
        <TitleSection title={t("title")} tagline={t("tagline")} align="left" />
      </section>
      <section className="mx-auto mt-8 max-w-6xl px-4 sm:mt-12 sm:px-6 sm:px-8">
        <BentoGrid className="sm:grid-cols-2 sm:grid-rows-3">
          {features.map(feature => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </section>
    </>
  )
}
