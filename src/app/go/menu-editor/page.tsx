import { redirect } from "next/navigation"

import { getMenus } from "@/server/actions/menu/queries"
import {
  getCurrentOrganization,
  hasOrganizations
} from "@/server/actions/user/queries"
import { getCurrentUser } from "@/lib/session"

/**
 * Smart entry for the marketing "Publish menu" CTA.
 *
 * - Guest → /login (signup may redirect unapproved users to waitlist /
 *   /auth-error?type=access_denied)
 * - Logged in, no organization → /new-org
 * - Logged in with a menu → /menu-editor/[id]
 * - Logged in with org but no menu yet → /dashboard
 */
export default async function GoMenuEditorPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/go/menu-editor")}`)
  }

  const orgCount = await hasOrganizations()
  if (orgCount === 0) {
    redirect("/new-org")
  }

  const currentOrg = await getCurrentOrganization()
  if (!currentOrg) {
    redirect("/new-org")
  }

  const { menus, activeMenuId } = await getMenus(currentOrg.id)
  const preferredId =
    activeMenuId && menus.some(menu => menu.id === activeMenuId)
      ? activeMenuId
      : menus[0]?.id

  if (preferredId) {
    redirect(`/menu-editor/${preferredId}`)
  }

  redirect("/dashboard")
}
