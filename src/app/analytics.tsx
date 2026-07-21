"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

import { useSession } from "@/lib/auth-client"
import { env } from "@/env.mjs"

function initPostHog() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "production") {
    return
  }

  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "always",
    autocapture: true,
    capture_pageview: false
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog()
  }, [])

  if (process.env.NODE_ENV !== "production") {
    return children
  }

  return (
    <PostHogProvider client={posthog}>
      <PostHogWrapper>
        <PageviewTracker />
        {children}
      </PostHogWrapper>
    </PostHogProvider>
  )
}

function PostHogWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return
    }

    if (session?.user) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name
      })
    } else {
      posthog.reset()
    }
  }, [session])

  return children
}

function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return
    }

    // Track pageview on route change
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture("$pageview", {
        $current_url: url
      })
    }
  }, [pathname, searchParams])

  return null
}
