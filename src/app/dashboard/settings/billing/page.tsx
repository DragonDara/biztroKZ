import { Suspense } from "react"
import { subscriptionsEnabled } from "@/flags"
import { AlertCircle } from "lucide-react"
import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getItemCount } from "@/server/actions/item/queries"
import {
  getCurrentMembershipRole,
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import { BasicPlanView } from "@/app/dashboard/settings/billing/basic-plan-view"
import { BillingPageHeader } from "@/app/dashboard/settings/billing/billing-page-header"
import { ProPlanView } from "@/app/dashboard/settings/billing/pro-plan-view"
import RevalidateStatus from "@/app/dashboard/settings/billing/revalidate-status"
import { MembershipRole } from "@/lib/types/organization"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.settings.billing")

  return {
    title: t("metaTitle")
  }
}

export default async function BillingPage() {
  const [subsEnabled, role, isPro, itemCount, currentOrg, t] =
    await Promise.all([
      subscriptionsEnabled(),
      getCurrentMembershipRole(),
      isProMember(),
      getItemCount(),
      getCurrentOrganization(),
      getTranslations("dashboard.settings.billing")
    ])

  if (!currentOrg) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <BillingPageHeader />
      {role === MembershipRole.OWNER && subsEnabled ? (
        <div className="my-10">
          {isPro ? (
            <Suspense fallback={<Skeleton className="h-48" />}>
              <ProPlanView />
              <RevalidateStatus />
            </Suspense>
          ) : (
            <div className="flex flex-col gap-6">
              <Suspense fallback={<Skeleton className="h-48" />}>
                <BasicPlanView itemCount={itemCount} />
              </Suspense>
            </div>
          )}
        </div>
      ) : (
        <Alert className="my-10" variant="warning">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("ownerOnlyTitle")}</AlertTitle>
          <AlertDescription>{t("ownerOnlyDescription")}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
