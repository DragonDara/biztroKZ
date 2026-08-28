import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { getCategories, getMenuSections } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { CategoriesPageHeader } from "@/app/dashboard/menu-items/categories/categories-page-header"
import CategoryTable from "@/app/dashboard/menu-items/categories/category-table"
import MenuSectionList from "@/app/dashboard/menu-items/categories/menu-section-list"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.menuItems.categories")

  return {
    title: t("metaTitle")
  }
}

export default async function CategoriesPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  const [data, menuSections] = await Promise.all([
    getCategories(currentOrg.id),
    getMenuSections(currentOrg.id)
  ])

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <CategoriesPageHeader menuSections={menuSections} />
      <div className="mt-6 flex flex-col gap-6">
        <MenuSectionList menuSections={menuSections} />
        <CategoryTable data={data} menuSections={menuSections} />
      </div>
    </div>
  )
}
