import type { AppLocale } from "@/i18n/routing"
import { enUS, es, ru, type Locale } from "date-fns/locale"

const locales: Record<AppLocale, Locale> = {
  en: enUS,
  es,
  ru
}

export function getDateFnsLocale(locale: string): Locale {
  if (locale in locales) {
    return locales[locale as AppLocale]
  }
  return enUS
}
