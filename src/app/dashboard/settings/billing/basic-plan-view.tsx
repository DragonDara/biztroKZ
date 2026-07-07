"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { Gauge } from "@suyalcinkaya/gauge"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { TextMorph } from "torph/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { appConfig } from "@/app/config"
import { authClient } from "@/lib/auth-client"
import { Plan, Tiers } from "@/lib/types/billing"

export function BasicPlanView({ itemCount }: { itemCount: number }) {
  const theme = useTheme()
  const t = useTranslations("dashboard.settings.billing")
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  )

  const { data: activeOrganization } = authClient.useActiveOrganization()

  const handleStripeCheckout = async () => {
    const { error } = await authClient.subscription.upgrade({
      plan: Plan.PRO,
      annual: billingInterval === "yearly",
      referenceId: activeOrganization?.id,
      successUrl: "/dashboard/settings/billing",
      cancelUrl: "/dashboard/settings/billing"
    })

    if (error) {
      console.error("Error creating checkout session:", error)
      Sentry.captureException(error, {
        tags: { section: "billing-checkout" },
        extra: {
          organizationId: activeOrganization?.id,
          plan: Plan.PRO,
          billingInterval
        }
      })
      toast.error(t("checkoutError"))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("plan")}</CardTitle>
        <CardDescription>{t("basic")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-2 flex flex-row gap-4">
          <div className="hidden sm:block">
            <Gauge
              value={itemCount * 10}
              showAnimation
              size="sm"
              primary="oklch(51.1% 0.262 276.966)"
              secondary={theme.resolvedTheme === "dark" ? "#27272a" : "#cfcfcf"}
            />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <p
              className="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              {t("usage", { count: itemCount, limit: appConfig.itemLimit })}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("usageHint")}
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-start-2">
            <ToggleGroup
              type="single"
              value={billingInterval}
              onValueChange={value =>
                value && setBillingInterval(value as "monthly" | "yearly")
              }
              className="w-full justify-center gap-0.5 rounded-lg border
                border-gray-200 p-1 dark:border-gray-800"
            >
              <ToggleGroupItem
                value="monthly"
                className="w-1/2 text-sm data-[state=on]:bg-indigo-600
                  data-[state=on]:text-white"
              >
                {t("monthly")}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="w-1/2 text-sm data-[state=on]:bg-indigo-600
                  data-[state=on]:text-white"
              >
                {t("yearly")}
                <span
                  className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5
                    text-xs font-medium text-green-600 dark:bg-green-900
                    dark:text-green-300"
                >
                  {t("yearlyDiscount")}
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {Tiers.map(tier => (
            <Card
              key={tier.id}
              className={
                tier.id === Plan.PRO
                  ? "border-indigo-500 dark:border-indigo-500"
                  : "hidden border-dashed sm:block"
              }
            >
              <CardHeader>
                <div>
                  <CardTitle className="text-sm">
                    {`${t("plan")} ${tier.name}`}
                  </CardTitle>
                  {tier.id === Plan.PRO ? (
                    <div className="mt-1 text-sm">
                      {billingInterval === "monthly"
                        ? `${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(tier.priceMonthly)} ${t("perMonth")}`
                        : `${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(tier.priceYearly)} ${t("perYear")}`}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-500">
                      {t("free")}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tier.features.map(feature => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="justify-end py-4">
        <Button onClick={handleStripeCheckout} className="w-full sm:w-auto">
          <TextMorph>
            {billingInterval === "monthly"
              ? t("upgradeMonthly")
              : t("upgradeYearly")}
          </TextMorph>
        </Button>
      </CardFooter>
    </Card>
  )
}
