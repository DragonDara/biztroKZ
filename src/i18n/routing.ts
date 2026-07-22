import { defineRouting } from "next-intl/routing"

export const locales = ["en", "es", "ru"] as const

export type AppLocale = (typeof locales)[number]

export const localePathSegments = new Set<string>(locales)

/** Used when no orgs exist at build time (Cache Components requires ≥1 param). */
export const staticParamsPlaceholder = "__static-params-placeholder__"

export function isAppLocalePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  return segments.length === 1 && localePathSegments.has(segments[0]!)
}

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "never",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365
  }
})
