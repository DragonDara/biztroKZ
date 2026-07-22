"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"
import { providers } from "@/lib/types/auth"

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useTranslations("auth.login")
  const params = useSearchParams()

  let defaultUrl = (params?.get("callbackUrl") as string) ?? "/dashboard"

  if (callbackUrl) {
    defaultUrl = callbackUrl
  }

  let error: string | null = null
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search)
    error = urlParams.get("error")
  }

  return (
    <div>
      {Object.values(providers).map(provider => (
        <Button
          key={provider.name}
          onClick={() =>
            signIn.social({
              provider: provider.id,
              callbackURL: defaultUrl ? defaultUrl : "/dashboard"
            })
          }
          className="mt-4 w-full shadow-xs"
          variant="outline"
        >
          <Image
            src={`/${provider.name.toLowerCase()}.svg`}
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="mr-2"
            unoptimized
          />
          {t("continueWith", { provider: provider.name })}
        </Button>
      ))}
      {error && (
        <div className="mt-8">
          <Alert variant="destructive">
            <AlertDescription>{t("error")}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
