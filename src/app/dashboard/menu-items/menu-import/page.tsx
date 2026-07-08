import { simulatePdfAi } from "@/flags"
import { FileText } from "lucide-react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import MenuImportForm from "@/app/dashboard/menu-items/menu-import/menu-import-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.menuItems.import")

  return {
    title: t("metaTitle")
  }
}

function getReturnTo(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return undefined
  }

  return value.startsWith("/dashboard") || value.startsWith("/new-org")
    ? value
    : undefined
}

export default async function PdfImportPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [currentOrg, searchParams, t] = await Promise.all([
    getCurrentOrganization(),
    props.searchParams,
    getTranslations("dashboard.menuItems.import")
  ])

  if (!currentOrg) {
    return notFound()
  }

  const simulateEnabled = await simulatePdfAi()

  const isPro = currentOrg.plan?.toUpperCase() === "PRO"
  const returnTo = getReturnTo(searchParams.returnTo)

  return (
    <div className="mx-auto w-full min-w-0 grow px-4 sm:px-6">
      <PageSubtitle>
        <PageSubtitle.Icon icon={FileText} />
        <PageSubtitle.Title>{t("pageTitle")}</PageSubtitle.Title>
        <PageSubtitle.Description>
          {t("pageDescription")}
        </PageSubtitle.Description>
      </PageSubtitle>
      <div className="mt-10">
        <MenuImportForm
          simulateEnabled={simulateEnabled}
          isPro={isPro}
          returnTo={returnTo}
        />
      </div>
    </div>
  )
}
