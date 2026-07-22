"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"

import Footer from "@/components/marketing/footer"
import Navbar from "@/components/marketing/nav-bar"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const t = useTranslations("errors.notFound")

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
          404
        </h1>
        <div className="space-y-2 text-center text-gray-500">
          <h2 className="text-2xl sm:text-3xl">{t("title")}</h2>
          <p>{t("description")}</p>
        </div>
        <Link href="/" prefetch={false}>
          <Button>{t("backHome")}</Button>
        </Link>
      </div>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  )
}
