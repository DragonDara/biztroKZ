import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { getDefaultLocation } from "@/server/actions/location/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import HoursForm from "@/app/dashboard/settings/locations/hours-form"
import LocationForm from "@/app/dashboard/settings/locations/location-form"
import {
  LocationContactHeader,
  LocationHoursHeader
} from "@/app/dashboard/settings/locations/location-page-headers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.settings.location")

  return {
    title: t("metaTitle")
  }
}

export default async function LocationPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  const data = await getDefaultLocation(currentOrg.id)

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <LocationContactHeader />
      <LocationForm data={data} enabled />
      <Separator className="my-8" />
      <LocationHoursHeader />
      <HoursForm data={data} />
    </div>
  )
}
