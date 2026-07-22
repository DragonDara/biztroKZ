"use client"

import { Tags } from "lucide-react"
import { useTranslations } from "next-intl"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Button } from "@/components/ui/button"
import CategoryEdit from "@/app/dashboard/menu-items/categories/category-edit"
import { ActionType } from "@/lib/types/category"

export function CategoriesPageHeader() {
  const t = useTranslations("dashboard.menuItems.categories")

  return (
    <PageSubtitle>
      <PageSubtitle.Icon icon={Tags} />
      <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
      <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
      <PageSubtitle.Actions>
        <CategoryEdit action={ActionType.CREATE}>
          <Button>{t("addCategory")}</Button>
        </CategoryEdit>
      </PageSubtitle.Actions>
    </PageSubtitle>
  )
}
