import { getTranslations } from "next-intl/server"

import { OnboardingCards } from "@/components/dashboard/onboarding-cards"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getOrganizationOnboardingStatus } from "@/server/actions/organization/queries"

export default async function OnboardingStatus({
  orgId
}: {
  orgId: string | undefined
}) {
  if (!orgId) return null

  const orgData = await getOrganizationOnboardingStatus(orgId)

  const orgReady = Boolean(orgData?.logo)
  const locationReady = orgData?.location.length
    ? orgData.location.length > 0
    : false
  const menuItemsReady = orgData?._count.menuItems
    ? orgData._count.menuItems > 0
    : false

  let progress = 0
  progress +=
    (orgReady ? 33 : 0) + (locationReady ? 33 : 0) + (menuItemsReady ? 34 : 0)

  if (progress < 100) {
    return (
      <OnboardingCards
        orgReady={orgReady}
        locationReady={locationReady}
        menuItemsReady={menuItemsReady}
        progress={progress}
      />
    )
  }

  const t = await getTranslations("dashboard.onboarding")

  return (
    <PageSubtitle>
      <PageSubtitle.Title>{t("welcomeTitle")}</PageSubtitle.Title>
      <PageSubtitle.Description>
        {t("welcomeDescription")}
      </PageSubtitle.Description>
    </PageSubtitle>
  )
}
