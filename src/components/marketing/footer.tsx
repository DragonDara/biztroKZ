"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"

export default function Footer() {
  const t = useTranslations("marketing.footer")

  const links = [
    { text: t("terms"), url: "/terms" },
    { text: t("privacy"), url: "/privacy" }
  ]

  return (
    <footer
      className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-10 lg:pb-10"
    >
      <div className="flex items-center justify-between gap-x-5">
        <div className="flex items-center gap-x-2">
          <Image
            src="/safari-pinned-tab.svg"
            alt={t("logoAlt")}
            width={24}
            height={24}
            unoptimized
            className="opacity-30 dark:invert"
          />
          <p className="text-sm font-medium text-taupe-500 dark:text-taupe-400">
            <span className="hidden sm:inline">biztro</span> &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </div>

        <ul className="flex items-center justify-center gap-x-5 sm:gap-x-10">
          <li
            className="text-[15px]/normal font-medium text-taupe-500
              transition-all duration-100 ease-linear hover:text-taupe-950
              hover:underline hover:underline-offset-4 dark:text-taupe-400
              dark:hover:text-taupe-50"
          >
            <a href="mailto:contacto@biztro.co">{t("contact")}</a>
          </li>
          {links.map((link, index) => (
            <li
              key={index}
              className="text-[15px]/normal font-medium text-taupe-500
                transition-all duration-100 ease-linear hover:text-taupe-950
                hover:underline hover:underline-offset-4 dark:text-taupe-400
                dark:hover:text-taupe-50"
            >
              <a href={link.url}>{link.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
