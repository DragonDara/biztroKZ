"use client"

import { CreditCard, MapPin, Settings, Users } from "lucide-react"
import { useTranslations } from "next-intl"

import { DashboardSecondaryNav } from "@/components/dashboard/dashboard-secondary-nav"
import type { SecondaryNavItem } from "@/components/dashboard/secondary-nav"

export function SettingsSecondaryNav() {
  const t = useTranslations("dashboard.nav")

  const items = [
    {
      title: t("general"),
      href: "dashboard/settings",
      icon: <Settings className="size-4 shrink-0" />
    },
    {
      title: t("location"),
      href: "dashboard/settings/locations",
      icon: <MapPin className="size-4 shrink-0" />
    },
    {
      title: t("members"),
      href: "dashboard/settings/members",
      icon: <Users className="size-4 shrink-0" />
    },
    {
      title: t("billing"),
      href: "dashboard/settings/billing",
      icon: <CreditCard className="size-4 shrink-0" />
    }
  ] satisfies SecondaryNavItem[]

  return <DashboardSecondaryNav items={items} />
}
