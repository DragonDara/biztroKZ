import { UserRound } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { type Metadata } from "next/types"

import PageHeader from "@/components/dashboard/page-header"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import {
  getCurrentMembership,
  getCurrentOrganization
} from "@/server/actions/user/queries"
import { MembershipRole } from "@/lib/types/organization"
import { getInitials } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.profile")

  return {
    title: t("metaTitle")
  }
}

export default async function ProfilePage() {
  const t = await getTranslations("dashboard.profile")

  const [organization, membership] = await Promise.all([
    getCurrentOrganization(),
    getCurrentMembership()
  ])

  if (!membership) return notFound()

  const roleLabel = (() => {
    switch (membership?.role) {
      case MembershipRole.ADMIN:
        return t("roleAdmin")
      case MembershipRole.MEMBER:
        return t("roleMember")
      case MembershipRole.OWNER:
        return t("roleOwner")
      default:
        return ""
    }
  })()

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="flex grow py-4">
        <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
          <PageSubtitle>
            <PageSubtitle.Title>{t("generalTitle")}</PageSubtitle.Title>
            <PageSubtitle.Description>
              {t("generalDescription")}
            </PageSubtitle.Description>
          </PageSubtitle>
          <div
            className="relative my-6 rounded-xl bg-linear-to-t from-white
              to-gray-100 dark:from-gray-950 dark:to-gray-900"
          >
            <div
              className="bg-dot-pattern dark:bg-dot-pattern-white absolute
                inset-0 size-full mask-t-from-50%"
            />
            <div className="flex h-36 items-center overflow-hidden px-7">
              <Avatar className="size-20 shadow-lg">
                {membership.user.image && (
                  <AvatarImage src={membership.user.image} />
                )}
                <AvatarFallback className="text-2xl">
                  {getInitials(
                    membership.user.name ?? membership.user.email ?? "U"
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="relative pr-8 pb-8 pl-8">
              <h3 className="text-xl leading-none font-semibold">
                {membership.user.name}
              </h3>
              <p
                className="mt-1.5 leading-none font-medium text-gray-600
                  dark:text-gray-400"
              >
                {membership.user.email}
              </p>
            </div>
          </div>
          <div>
            <PageSubtitle>
              <PageSubtitle.Title>{t("membershipTitle")}</PageSubtitle.Title>
              <PageSubtitle.Description>
                {t("membershipDescription")}
              </PageSubtitle.Description>
            </PageSubtitle>
            <div className="mt-6">
              {membership ? (
                <div
                  className="grid grid-cols-1 gap-6 rounded-lg border
                    border-gray-200 px-6 py-3 sm:grid-cols-2
                    dark:border-gray-800"
                >
                  <div>
                    <Label>{t("organization")}</Label>
                    <h4 className="text-gray-500">
                      {organization?.name || "N/A"}
                    </h4>
                  </div>
                  <div>
                    <Label>{t("role")}</Label>
                    <p className="text-gray-500">{roleLabel}</p>
                  </div>
                </div>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UserRound className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                    <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
