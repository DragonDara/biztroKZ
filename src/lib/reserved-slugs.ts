import { localePathSegments } from "@/i18n/routing"

/** First path segments reserved for the app — not public menu tenant slugs. */
export const reservedAppSlugs = new Set<string>([
  ...localePathSegments,
  "api",
  "auth-error",
  "blog",
  "dashboard",
  "ingest",
  "invite",
  "login",
  "menu-editor",
  "monitoring",
  "new-org",
  "privacy",
  "terms",
  "sites",
  "_next",
  "_vercel"
])

export function isReservedAppSlug(slug: string) {
  return reservedAppSlugs.has(slug)
}
