"use client"

import { Languages, ShoppingBag, Tags } from "lucide-react"
import { useTranslations } from "next-intl"

import { DashboardSecondaryNav } from "@/components/dashboard/dashboard-secondary-nav"
import type { SecondaryNavItem } from "@/components/dashboard/secondary-nav"

export function CatalogSecondaryNav() {
  const t = useTranslations("dashboard.nav")

  const items = [
    {
      title: t("products"),
      href: "dashboard/menu-items",
      icon: <ShoppingBag className="size-4 shrink-0" />
    },
    {
      title: t("categories"),
      href: "dashboard/menu-items/categories",
      icon: <Tags className="size-4 shrink-0" />
    },
    {
      title: t("translations"),
      href: "dashboard/menu-items/translations",
      icon: <Languages className="size-4 shrink-0" />
    }
  ] satisfies SecondaryNavItem[]

  return <DashboardSecondaryNav items={items} />
}
