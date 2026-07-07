"use client"

import { ShoppingBag } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import ItemCreate from "@/app/dashboard/menu-items/item-create"
import ItemImport from "@/app/dashboard/menu-items/item-import"

export function MenuItemsPageHeader() {
  const t = useTranslations("dashboard.menuItems.products")

  return (
    <PageSubtitle>
      <PageSubtitle.Icon icon={ShoppingBag} />
      <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
      <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
      <PageSubtitle.Actions>
        <div className="flex gap-2">
          <ItemImport />
          <ItemCreate />
        </div>
      </PageSubtitle.Actions>
    </PageSubtitle>
  )
}
