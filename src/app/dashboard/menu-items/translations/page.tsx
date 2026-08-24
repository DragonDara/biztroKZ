import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { getAvailableTranslations } from "@/server/actions/item/translations"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import TranslationsManager from "@/app/dashboard/menu-items/translations/translations-manager"
import { OrganizationStatus } from "@/lib/types/plan"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.menuItems.translations")

  return {
    title: t("metaTitle")
  }
}

export default async function TranslationsPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  const availableTranslations = await getAvailableTranslations(currentOrg.id)
  const isPro =
    currentOrg.plan?.toUpperCase() === "PRO" ||
    currentOrg.status === OrganizationStatus.SPONSORED

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <TranslationsManager
        key={currentOrg.id}
        availableTranslations={availableTranslations}
        isPro={isPro}
      />
    </div>
  )
}
