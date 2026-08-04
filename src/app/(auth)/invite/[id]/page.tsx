import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"

import { getInviteByToken } from "@/server/actions/user/queries"
import AcceptInviteCard from "@/app/(auth)/invite/[id]/accept-invite-card"
import LoginForm from "@/app/(auth)/login/login-form"
import { getCurrentUser } from "@/lib/session"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.invite")

  return {
    title: t("metaTitle")
  }
}

export default async function InvitePage(props: {
  params: Promise<{ id: string }>
}) {
  const [t, params] = await Promise.all([
    getTranslations("auth.invite"),
    props.params
  ])

  if (!params.id) {
    return (
      <InviteExpiredOrInvalid
        title={t("expiredTitle")}
        description={t("expiredDescription")}
      />
    )
  }

  const user = await getCurrentUser()

  // If user session exists, fetch the invitation data
  const invite = await getInviteByToken(params.id)

  if (user && invite.error) {
    // console.dir(invite, { depth: null })
    return (
      <InviteExpiredOrInvalid
        title={t("invalidTitle")}
        description={invite.error}
      />
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Image
        src="/logo-bistro.svg"
        alt="Logo"
        width={44}
        height={44}
        unoptimized
        className="py-6"
      />
      <div className="mt-0">
        {!user ? (
          <LoginForm callbackUrl={`/invite/${params.id}`} />
        ) : (
          <AcceptInviteCard invite={invite.data} />
        )}
      </div>
    </div>
  )
}

type InviteExpiredOrInvalidProps = {
  title: string
  description: string
}

const InviteExpiredOrInvalid = ({
  title,
  description
}: InviteExpiredOrInvalidProps) => {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Image
        src="/logo-bistro.svg"
        alt="Logo"
        width={44}
        height={44}
        unoptimized
        className="py-10"
      />
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
