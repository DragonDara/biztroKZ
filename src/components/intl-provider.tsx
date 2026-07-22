import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

import { HtmlLang } from "@/components/html-lang"
import Providers from "@/app/providers"

export async function IntlProvider({
  children
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLang />
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  )
}
