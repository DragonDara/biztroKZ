"use client"

import { localeLabels } from "@/i18n/config"
import { routing, type AppLocale } from "@/i18n/routing"
import { Languages } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

type LocaleSwitcherProps = {
  variant?: "icon" | "full"
  className?: string
}

export function LocaleSwitcher({
  variant = "icon",
  className
}: LocaleSwitcherProps) {
  const t = useTranslations("locale")
  const locale = useLocale() as AppLocale
  const router = useRouter()

  function handleLocaleChange(nextLocale: string) {
    const maxAge = 60 * 60 * 24 * 365
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${maxAge}`
    router.refresh()
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={variant === "icon" ? "icon-sm" : "sm"}
          className={className}
          aria-label={t("label")}
        >
          <Languages className="size-4" />
          {variant === "full" ? (
            <span className="ml-2">{localeLabels[locale]}</span>
          ) : (
            <span className="sr-only">{t("label")}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={handleLocaleChange}
        >
          {routing.locales.map(code => (
            <DropdownMenuRadioItem key={code} value={code}>
              {t(code)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
