"use client"

import { Tags } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Button } from "@/components/ui/button"
import type { getMenuSections } from "@/server/actions/item/queries"
import CategoryEdit from "@/app/dashboard/menu-items/categories/category-edit"
import MenuSectionEdit from "@/app/dashboard/menu-items/categories/menu-section-edit"
import { ActionType } from "@/lib/types/category"

export function CategoriesPageHeader({
  menuSections
}: {
  menuSections: Awaited<ReturnType<typeof getMenuSections>>
}) {
  const t = useTranslations("dashboard.menuItems.categories")

  return (
    <PageSubtitle>
      <PageSubtitle.Icon icon={Tags} />
      <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
      <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
      <PageSubtitle.Actions>
        <MenuSectionEdit action={ActionType.CREATE}>
          <Button variant="outline">{t("addMenuSection")}</Button>
        </MenuSectionEdit>
        <CategoryEdit action={ActionType.CREATE} menuSections={menuSections}>
          <Button>{t("addCategory")}</Button>
        </CategoryEdit>
      </PageSubtitle.Actions>
    </PageSubtitle>
  )
}
