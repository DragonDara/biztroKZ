import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import {
  getCurrentOrganization,
  safeHasPermission
} from "@/server/actions/user/queries"
import OrganizationDelete from "@/app/dashboard/settings/organization-delete"
import OrganizationForm from "@/app/dashboard/settings/organization-form"
import { SettingsOrganizationHeader } from "@/app/dashboard/settings/settings-organization-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.settings.organization")

  return {
    title: t("metaTitle"),
    description: t("metaDescription")
  }
}

export default async function SettingsPage() {
  const [currentOrg, canDeleteOrg] = await Promise.all([
    getCurrentOrganization(),
    safeHasPermission({ organization: ["delete"] })
  ])

  if (!currentOrg) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <SettingsOrganizationHeader />
      <OrganizationForm data={currentOrg} enabled />
      {canDeleteOrg?.success && (
        <OrganizationDelete organizationId={currentOrg.id} />
      )}
    </div>
  )
}
