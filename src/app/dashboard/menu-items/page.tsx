import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { getCategories, getMenuItems } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import ItemTable from "@/app/dashboard/menu-items/item-table"
import { MenuItemsPageHeader } from "@/app/dashboard/menu-items/menu-items-page-header"
import { type MenuItemQueryFilter } from "@/lib/types/menu-item"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.menuItems.products")

  return {
    title: t("metaTitle")
  }
}

export default async function ItemsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [searchParams, currentOrg] = await Promise.all([
    props.searchParams,
    getCurrentOrganization()
  ])

  if (!currentOrg) {
    return notFound()
  }

  const filter: MenuItemQueryFilter = {}

  if (searchParams.status) {
    filter.status = searchParams.status as string
  }

  if (searchParams.category) {
    filter.category = searchParams.category as string
  }

  const data = await getMenuItems(filter, currentOrg.id)
  const categories = await getCategories(currentOrg.id)

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <MenuItemsPageHeader />
      <div className="mt-6">
        <ItemTable data={data} categories={categories} />
      </div>
    </div>
  )
}
