import { Suspense } from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import OnboardingStatus from "@/components/dashboard/onboarding-status"
import { Skeleton } from "@/components/ui/skeleton"
import { getMenus } from "@/server/actions/menu/queries"
import {
  getCurrentOrganization,
  hasOrganizations
} from "@/server/actions/user/queries"
import { DashboardHomeHeader } from "@/app/dashboard/dashboard-home-header"
import MenuList from "@/app/dashboard/menu-list"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.menus")
  return {
    title: t("metaTitle")
  }
}

// skipcq: JS-0116
export default async function DashboardPage() {
  const [orgAvailable, currentOrg] = await Promise.all([
    hasOrganizations(),
    getCurrentOrganization()
  ])

  if (!orgAvailable) {
    redirect("/new-org")
  }

  const menus = getMenus(currentOrg?.id as string)

  return (
    <div className="relative flex grow pb-4">
      {/* Light mode gradient */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          background: `
          radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.06), transparent 20%),
          radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 200, 220, 0.05), transparent 30%),
          radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.07), transparent 35%),
          radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 180, 0, 0.04), transparent 10%),
          transparent
        `
        }}
      />
      {/* Dark mode gradient */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: `
          radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 20%),
          radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 30%),
          radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 35%),
          radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 10%),
          transparent
        `
        }}
      />
      <div
        className="z-10 mx-auto grid grow auto-rows-min justify-center gap-10
          px-4 py-10 sm:grid-cols-300 sm:px-6 sm:py-12"
      >
        <div className="col-span-full">
          <Suspense fallback={<OnboardingSkeleton />}>
            <OnboardingStatus orgId={currentOrg?.id} />
          </Suspense>
        </div>
        <div className="col-span-full">
          <DashboardHomeHeader orgSlug={currentOrg?.slug} />
        </div>
        <Suspense fallback={<MenuListSkeleton />}>
          <MenuList promiseMenus={menus} />
        </Suspense>
      </div>
    </div>
  )
}

function OnboardingSkeleton() {
  return (
    <>
      <Skeleton className="h-12 w-1/2" />
      <div className="mt-8 grid grid-cols-3 gap-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </>
  )
}

function MenuListSkeleton() {
  return (
    <>
      <Skeleton className="h-[250px]" />
      <Skeleton className="h-[250px]" />
      <Skeleton className="h-[250px]" />
      <Skeleton className="h-[250px]" />
    </>
  )
}
