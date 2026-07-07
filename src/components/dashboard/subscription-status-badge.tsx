"use client"

import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { SubscriptionStatus } from "@/lib/types/billing"

const variants: Record<
  SubscriptionStatus,
  "green" | "yellow" | "destructive" | "violet"
> = {
  [SubscriptionStatus.ACTIVE]: "green",
  [SubscriptionStatus.TRIALING]: "violet",
  [SubscriptionStatus.CANCELED]: "destructive",
  [SubscriptionStatus.INCOMPLETE]: "yellow",
  [SubscriptionStatus.INCOMPLETE_EXPIRED]: "destructive",
  [SubscriptionStatus.PAST_DUE]: "yellow",
  [SubscriptionStatus.UNPAID]: "destructive",
  [SubscriptionStatus.PAUSED]: "yellow",
  [SubscriptionStatus.SPONSORED]: "green"
}

const statusKeys: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: "active",
  [SubscriptionStatus.TRIALING]: "trialing",
  [SubscriptionStatus.CANCELED]: "canceled",
  [SubscriptionStatus.INCOMPLETE]: "incomplete",
  [SubscriptionStatus.INCOMPLETE_EXPIRED]: "incompleteExpired",
  [SubscriptionStatus.PAST_DUE]: "pastDue",
  [SubscriptionStatus.UNPAID]: "unpaid",
  [SubscriptionStatus.PAUSED]: "paused",
  [SubscriptionStatus.SPONSORED]: "sponsored"
}

export function SubscriptionStatusBadge({
  status
}: {
  status: SubscriptionStatus
}) {
  const t = useTranslations("dashboard.settings.subscriptionStatus")
  const key = statusKeys[status]

  return (
    <Badge variant={variants[status]}>
      {key ? t(key as "active") : t("unknown")}
    </Badge>
  )
}
