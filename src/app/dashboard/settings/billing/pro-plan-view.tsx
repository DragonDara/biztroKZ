import { AlertCircle, HeartHandshake } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentSubscription } from "@/server/actions/subscriptions/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { CustomerPortalButton } from "@/app/dashboard/settings/billing/customer-portal-button"
import { SubscriptionStatus, Tiers } from "@/lib/types/billing"

function formatBillingDate(
  date: Date | string | null | undefined,
  locale: string
) {
  if (!date) return "N/A"

  const localeTag =
    locale === "es" ? "es-MX" : locale === "ru" ? "ru-RU" : "en-US"

  return new Date(date).toLocaleDateString(localeTag, {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

const stripeStatusVariants = {
  trialing: "violet",
  active: "green",
  canceled: "destructive",
  incomplete: "yellow",
  incomplete_expired: "destructive",
  past_due: "yellow",
  unpaid: "destructive",
  paused: "secondary"
} as const

const stripeStatusKeys = {
  trialing: "trialing",
  active: "active",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "incompleteExpired",
  past_due: "pastDue",
  unpaid: "unpaid",
  paused: "paused"
} as const

type StripeStatus = keyof typeof stripeStatusKeys

export async function ProPlanView() {
  const [org, t, tStatus, locale] = await Promise.all([
    getCurrentOrganization(),
    getTranslations("dashboard.settings.billing"),
    getTranslations("dashboard.settings.subscriptionStatus"),
    getLocale()
  ])

  if (!org) {
    return null
  }
  const subscription = await getCurrentSubscription(org.id)

  if (org.status === SubscriptionStatus.SPONSORED) {
    return (
      <Alert variant="success">
        <HeartHandshake className="size-5" />
        <AlertTitle>{t("sponsoredTitle")}</AlertTitle>
        <AlertDescription>{t("sponsoredDescription")}</AlertDescription>
      </Alert>
    )
  }

  if (!subscription) {
    return null
  }

  const status = subscription.status as StripeStatus
  const statusKey = stripeStatusKeys[status]
  const statusVariant = stripeStatusVariants[status] ?? "secondary"
  const trialEnd = formatBillingDate(subscription.trialEnd, locale)
  const periodStart = formatBillingDate(subscription.periodStart, locale)
  const periodEnd = formatBillingDate(subscription.periodEnd, locale)

  const tier = Tiers.find(
    item =>
      item.priceMonthlyId === subscription.priceId ||
      item.priceYearlyId === subscription.priceId
  )
  const isMonthly = tier?.priceMonthlyId === subscription.priceId
  const priceLabel =
    tier && subscription.priceId
      ? `${new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN"
        }).format(
          isMonthly ? tier.priceMonthly : tier.priceYearly
        )} ${isMonthly ? t("perMonth") : t("perYear")}`
      : "N/A"

  return (
    <div className="rounded-xl bg-gray-100 dark:bg-gray-900/70">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("plan")}</CardTitle>
          <div
            className="flex items-center gap-2 text-sm text-gray-500
              dark:text-gray-400"
          >
            <span>PRO</span>
            <Badge variant={statusVariant}>
              {statusKey ? tStatus(statusKey) : tStatus("unknown")}
            </Badge>
            {subscription.status === "trialing" ? (
              <span className="text-sm text-gray-500">
                - {t("trialEnds", { date: trialEnd })}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 flex flex-row justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">{t("price")}</div>
              <div className="text-base font-medium">{priceLabel}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("activePeriod")}</div>
              <div className="text-base font-medium">{periodStart}</div>
            </div>
            {subscription.cancelAtPeriodEnd ? (
              <div>
                <div className="text-sm text-gray-500">{t("cancelsOn")}</div>
                <div className="text-base font-medium">{periodEnd}</div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-500">{t("nextRenewal")}</div>
                <div className="text-base font-medium">{periodEnd}</div>
              </div>
            )}
          </div>
          {subscription.cancelAtPeriodEnd ? (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="size-4" />
              <AlertTitle>{t("cancelScheduledTitle")}</AlertTitle>
              <AlertDescription>
                {t("cancelScheduledDescription", { date: periodEnd })}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <Separator />
        <CardFooter className="items-center justify-between gap-1 py-4">
          <p className="text-sm text-gray-500">{t("manageInStripe")}</p>
          <CustomerPortalButton referenceId={org.id} />
        </CardFooter>
      </Card>
      <div className="w-full px-4 py-2 text-sm text-gray-400 dark:text-gray-600">
        {t("supportPrefix")}{" "}
        <a
          href="mailto:contacto@biztro.co"
          className="text-indigo-500 hover:underline"
        >
          contacto@biztro.co
        </a>
      </div>
    </div>
  )
}
