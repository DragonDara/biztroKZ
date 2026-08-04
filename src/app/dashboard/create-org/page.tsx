import { Store } from "lucide-react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import NewOrgForm from "../../(auth)/new-org/new-org-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.onboarding")

  return {
    title: t("createOrgTitle"),
    description: t("createOrgDescription")
  }
}

export default async function Page() {
  const t = await getTranslations("auth.onboarding")

  return (
    <div className="flex grow py-4">
      <div className="mx-auto flex max-w-2xl grow flex-col gap-4 px-4 sm:px-0">
        <PageSubtitle>
          <PageSubtitle.Icon icon={Store} />
          <PageSubtitle.Title>{t("createOrgTitle")}</PageSubtitle.Title>
          <PageSubtitle.Description>
            {t("createOrgSubtitle")}
          </PageSubtitle.Description>
        </PageSubtitle>
        <NewOrgForm />
      </div>
    </div>
  )
}
