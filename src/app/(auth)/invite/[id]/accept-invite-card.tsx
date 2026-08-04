"use client"

import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { acceptInvite } from "@/server/actions/user/mutations"
import type { getInviteByToken } from "@/server/actions/user/queries"
import { authClient } from "@/lib/auth-client"
import { getInitials } from "@/lib/utils"

type InviteData =
  Awaited<ReturnType<typeof getInviteByToken>> extends { data: infer D }
    ? D
    : Awaited<ReturnType<typeof getInviteByToken>>

export default function AcceptInviteCard({ invite }: { invite: InviteData }) {
  const t = useTranslations("auth.invite")
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  const { execute, status } = useAction(acceptInvite, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        console.error(data.failure.reason)
        Sentry.captureMessage(data.failure.reason, {
          level: "error",
          tags: { section: "invite-accept" }
        })
        toast.error(t("acceptError"))
      } else if (data?.success) {
        router.push("/dashboard")
      }
    }
  })

  const handleAccept = async (id: string) => {
    await execute({ id })
  }

  if (!invite) {
    return null
  }

  return (
    <Card className="mx-auto max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-pretty">
          {isPending || !session ? (
            <Skeleton className="h-6 w-3/4" />
          ) : (
            t.rich("greeting", {
              name: session?.user.name ? ` ${session.user.name}` : "",
              org: invite?.organizationName ?? "",
              orgName: chunks => (
                <span className="text-orange-600">{chunks}</span>
              )
            })
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPending || !session ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div>
            <div
              className="flex w-full flex-col items-center justify-center gap-8
                py-2"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="size-6">
                  <AvatarImage
                    src={session?.user.image ?? undefined}
                    alt="Avatar"
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(session?.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {t("signedInAs", { email: session?.user.email ?? "" })}
                </span>
              </div>
              <p className="text-sm">{t("acceptHint")}</p>
            </div>
            <form>
              <div className="mt-4">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => handleAccept(invite?.id)}
                  disabled={status === "executing" || isPending}
                >
                  {t("acceptButton")}
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("termsNotice")}
        </p>
      </CardFooter>
    </Card>
  )
}
