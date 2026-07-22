import type { Layout } from "react-resizable-panels"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import WorkbenchLoader from "@/components/menu-editor/workbench-loader"
import {
  getCategoriesWithItems,
  getFeaturedItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"
import { getDefaultLocation } from "@/server/actions/location/queries"
import {
  getMenuById,
  getMenuTitleById,
  getThemes
} from "@/server/actions/menu/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { debugLog } from "@/lib/debug-log"

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const params = await props.params
  const menuName = await getMenuTitleById(params.id)

  if (menuName) {
    return { title: menuName }
  }

  const t = await getTranslations("menuEditor.menuMeta")
  return { title: t("notFound") }
}

export default async function MenuEditorPage(props: {
  params: Promise<{ id: string }>
}) {
  const pageStart = Date.now()
  debugLog({
    hypothesisId: "H",
    location: "menu-editor/page.tsx:start",
    message: "MenuEditorPage started",
    data: { elapsedMs: 0 }
  })

  const params = await props.params
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["themes"],
    queryFn: () => getThemes({ themeType: "COLOR" })
  })

  const currentOrg = await getCurrentOrganization()

  if (!currentOrg || !params?.id) {
    return notFound()
  }

  const [categories, soloItems, location, featuredItems, menu] =
    await Promise.all([
      getCategoriesWithItems(),
      getMenuItemsWithoutCategory(),
      getDefaultLocation(currentOrg.id),
      getFeaturedItems(),
      getMenuById(params.id)
    ])

  debugLog({
    hypothesisId: "H",
    location: "menu-editor/page.tsx:after-data",
    message: "Menu editor data loaded",
    data: {
      menuId: params.id,
      hasMenu: Boolean(menu),
      elapsedMs: Date.now() - pageStart
    },
    runId: "post-fix"
  })

  if (!menu || !currentOrg) {
    return notFound()
  }

  const cookieStore = await cookies()
  const layoutCookie = cookieStore.get(
    "react-resizable-panels:layout:menu-editor-workbench"
  )

  let defaultLayout: Layout | undefined
  if (layoutCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(layoutCookie.value))
      if (Array.isArray(parsed)) {
        const layout: Layout = {}
        parsed.forEach((v: number, i: number) => {
          layout[i.toString()] = v
        })
        defaultLayout = layout
      } else if (parsed && typeof parsed === "object") {
        defaultLayout = parsed as Layout
      }
    } catch {
      defaultLayout = undefined
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkbenchLoader
        menu={menu}
        organization={currentOrg}
        location={location}
        categories={categories}
        soloItems={soloItems}
        featuredItems={featuredItems}
        defaultLayout={defaultLayout}
      />
    </HydrationBoundary>
  )
}
