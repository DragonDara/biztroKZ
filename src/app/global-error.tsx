"use client"

import { useEffect } from "react"
import { Link } from "@/i18n/navigation"
import type { AppLocale } from "@/i18n/routing"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import ru from "@/messages/ru.json"
import * as Sentry from "@sentry/nextjs"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import { Inter, Sora } from "next/font/google"

import Navbar from "@/components/marketing/nav-bar"
import { Button } from "@/components/ui/button"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora"
})

const messageMap = {
  en,
  es,
  ru
} as const

function getLocaleFromCookie(): AppLocale {
  if (typeof document === "undefined") {
    return "en"
  }

  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
  const locale = match?.[1]

  if (locale === "es" || locale === "ru") {
    return locale
  }

  return "en"
}

function GlobalErrorContent() {
  const t = useTranslations("errors.global")

  return (
    <div className="flex h-dvh w-full flex-col">
      <Navbar />
      <div
        className="flex h-96 grow flex-col items-center justify-center gap-6
          sm:gap-12"
      >
        <h1
          className="font-display text-6xl font-medium text-gray-800
            slashed-zero sm:text-8xl dark:text-gray-200"
        >
          {t("title")}
        </h1>
        <div className="space-y-2 text-center text-gray-500">
          <h2 className="text-2xl sm:text-3xl">{t("heading")}</h2>
          <p>{t("description")}</p>
        </div>
        <Link href="/" prefetch={false}>
          <Button>{t("backHome")}</Button>
        </Link>
      </div>
      <div className="w-full" />
    </div>
  )
}

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string }
}) {
  const locale = getLocaleFromCookie()

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html
      className={`${inter.variable} ${sora.variable} scroll-smooth antialiased`}
      lang={locale}
    >
      <body className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
        <NextIntlClientProvider locale={locale} messages={messageMap[locale]}>
          <GlobalErrorContent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
