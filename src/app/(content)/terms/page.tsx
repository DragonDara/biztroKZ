import type { AppLocale } from "@/i18n/routing"
import type { Metadata } from "next"
import { getLocale } from "next-intl/server"

import { getTermsMeta, TermsBody } from "./terms-body"

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale
  return getTermsMeta(locale)
}

export default async function TermsPage() {
  const locale = (await getLocale()) as AppLocale
  const application = "Biztro"

  return (
    <section className="prose prose-gray dark:prose-invert mt-10">
      <TermsBody locale={locale} application={application} />
    </section>
  )
}
