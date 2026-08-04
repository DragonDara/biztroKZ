import { isAppLocalePath, type AppLocale } from "@/i18n/routing"
import { getSessionCookie } from "better-auth/cookies"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { isReservedAppSlug } from "@/lib/reserved-slugs"

const RESERVED_SUBDOMAINS = new Set([
  "preview",
  "www",
  "images",
  "static",
  "mail",
  "pm-bounces",
  "send",
  // App UI locales — must not be treated as tenant subdomains
  "ru",
  "en",
  "es"
])

function getSubdomainFromHost(hostname: string) {
  if (
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    hostname === "localhost"
  )
    return null

  if (hostname.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)) {
    const subdomain = hostname.slice(
      0,
      -`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`.length
    )
    return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain
  }

  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.slice(0, -".localhost".length)
    return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain
  }

  return null
}

function rewriteToTenantSite(
  request: NextRequest,
  slug: string,
  pathname: string
) {
  const rewriteUrl = request.nextUrl.clone()

  if (
    pathname === "/" ||
    pathname === `/${slug}` ||
    pathname.startsWith(`/${slug}/`)
  ) {
    const suffix =
      pathname === "/" || pathname === `/${slug}`
        ? ""
        : pathname.slice(slug.length + 1)
    rewriteUrl.pathname = `/sites/${slug}${suffix}`
  } else {
    rewriteUrl.pathname = `/sites/${slug}${pathname}`
  }

  return NextResponse.rewrite(rewriteUrl)
}

function tryPathBasedTenantRewrite(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length !== 1) {
    return null
  }

  const slug = segments[0]!
  if (isReservedAppSlug(slug)) {
    return null
  }

  return rewriteToTenantSite(request, slug, pathname)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const subdomain = getSubdomainFromHost(request.nextUrl.hostname)

  if (subdomain) {
    if (pathname.startsWith("/_next") || pathname.startsWith("/sites/")) {
      return NextResponse.next()
    }

    return rewriteToTenantSite(request, subdomain, pathname)
  }

  const tenantRewrite = tryPathBasedTenantRewrite(request)
  if (tenantRewrite) {
    return tenantRewrite
  }

  // /en, /es, /ru set the locale cookie — not tenant slugs
  if (isAppLocalePath(pathname)) {
    const locale = pathname.split("/").filter(Boolean)[0] as AppLocale
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/"
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    })
    return response
  }

  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

// Skip Next internals, APIs, static assets (paths with a dot), and ingest
export const config = {
  matcher: ["/((?!api|_next|_vercel|ingest|monitoring|.*\\..*).*)"]
}
