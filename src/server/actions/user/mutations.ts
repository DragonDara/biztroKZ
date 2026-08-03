"use server"

import * as Sentry from "@sentry/nextjs"
import { refresh, updateTag } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod/v4"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { authActionClient } from "@/lib/safe-actions"

export const switchOrganization = authActionClient
  .inputSchema(
    z.object({
      organizationId: z.string(),
      currentOrganizationId: z.string()
    })
  )
  .action(
    async ({ parsedInput: { organizationId, currentOrganizationId } }) => {
      try {
        const requestHeaders = await headers()
        const data = await auth.api.setActiveOrganization({
          body: {
            organizationId
          },
          headers: requestHeaders
        })

        if (!data) {
          return {
            failure: {
              reason: "No se pudo cambiar de organización"
            }
          }
        }

        updateTag("organization-current")
        updateTag("membership-current")
        updateTag("membership-current-role")
        updateTag("permissions-all")
        updateTag(`organization-${organizationId}-subscription`)
        if (currentOrganizationId) {
          updateTag(`organization-${currentOrganizationId}-subscription`)
        }
        updateTag(`organization-${organizationId}-members`)
        if (currentOrganizationId) {
          updateTag(`organization-${currentOrganizationId}-members`)
        }
        updateTag(`menus-${organizationId}`)
        updateTag(`translations-${organizationId}`)
        if (currentOrganizationId) {
          updateTag(`menus-${currentOrganizationId}`)
          updateTag(`translations-${currentOrganizationId}`)
        }
        updateTag("subscription-current")
        updateTag("page-settings")
        updateTag("page-settings-members")
        updateTag(`page-settings-${organizationId}`)
        updateTag(`page-settings-members-${organizationId}`)
        if (currentOrganizationId) {
          updateTag(`page-settings-${currentOrganizationId}`)
          updateTag(`page-settings-members-${currentOrganizationId}`)
        }
        return { success: true }
      } catch (error) {
        console.error("Error switching organization:", error)
        Sentry.captureException(error, {
          tags: { section: "user-mutations" },
          extra: { organizationId, currentOrganizationId }
        })
        return {
          failure: {
            reason: "Error cambiando de organización"
          }
        }
      }
    }
  )

export const inviteMember = authActionClient
  .inputSchema(
    z.object({
      email: z.email()
    })
  )
  .action(async ({ parsedInput: { email } }) => {
    try {
      const requestHeaders = await headers()
      const data = await auth.api.createInvitation({
        body: {
          email,
          role: "member",
          resend: true
        },
        headers: requestHeaders
      })

      if (data) {
        const normalized = email.trim().toLowerCase()
        await prisma.waitlist.upsert({
          where: { email: normalized },
          create: { email: normalized, enabled: true },
          update: { enabled: true }
        })

        const activeOrg = await auth.api.getFullOrganization({
          headers: requestHeaders
        })

        if (activeOrg?.id) {
          updateTag(`organization:${activeOrg.id}:members`)
          updateTag(`organization:${activeOrg.id}`)
          updateTag(`page:settings:${activeOrg.id}`)
          updateTag(`page:settings:members:${activeOrg.id}`)
          updateTag(`organization:${activeOrg.id}:subscription`)
        }
        updateTag("permissions:all")
        updateTag("page:settings")
        updateTag("page:settings:members")
        refresh() // Refresh the current route to show the new member
        return { success: true }
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      Sentry.captureException(error, {
        tags: { section: "user-mutations" },
        extra: { email }
      })
      return {
        failure: {
          reason: "Error invitando al miembro"
        }
      }
    }
  })

export const acceptInvite = authActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      const requestHeaders = await headers()
      const data = await auth.api.acceptInvitation({
        body: {
          invitationId: id
        },
        headers: requestHeaders
      })

      if (!data) {
        return {
          failure: {
            reason: "No se pudo aceptar la invitación"
          }
        }
      }

      // Better Auth обычно отдаёт member и/или invitation
      const organizationId =
        data.member?.organizationId ?? data.invitation?.organizationId ?? null
      if (organizationId) {
        const activated = await auth.api.setActiveOrganization({
          body: { organizationId },
          headers: requestHeaders
        })
        if (!activated) {
          return {
            failure: {
              reason: "No se pudo establecer la organización activa"
            }
          }
        }
      }

      const activeOrg = await auth.api.getFullOrganization({
        headers: requestHeaders
      })

      updateTag(`invitation:${id}`)
      updateTag("organization:current")
      updateTag("organization-current")
      updateTag("organizations-list")
      updateTag("membership:current")
      updateTag("membership-current")
      updateTag("membership:current:role")
      updateTag("membership-current-role")
      updateTag("permissions:all")
      updateTag("permissions-all")
      if (activeOrg?.id) {
        updateTag(`organization:${activeOrg.id}:members`)
        updateTag(`organization-${activeOrg.id}-members`)
        updateTag(`organization:${activeOrg.id}`)
        updateTag(`organization-${activeOrg.id}`)
        updateTag(`organization:${activeOrg.id}:subscription`)
        updateTag(`organization-${activeOrg.id}-subscription`)
        updateTag(`page:settings:${activeOrg.id}`)
        updateTag(`page:settings:members:${activeOrg.id}`)
      }
      updateTag("page:settings")
      updateTag("page:settings:members")

      return { success: true }
    } catch (error) {
      console.error("Error accepting invite:", error)
      Sentry.captureException(error, {
        tags: { section: "user-mutations" },
        extra: { invitationId: id }
      })
      return {
        failure: {
          reason: "Error aceptando la invitación"
        }
      }
    }
  })

export const removeMember = authActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      const requestHeaders = await headers()
      const data = await auth.api.removeMember({
        body: {
          memberIdOrEmail: id
        },
        headers: requestHeaders
      })

      if (!data) {
        return {
          failure: {
            reason: "No se pudo eliminar al miembro"
          }
        }
      }

      const activeOrg = await auth.api.getFullOrganization({
        headers: requestHeaders
      })

      if (activeOrg?.id) {
        updateTag(`organization-${activeOrg.id}-members`)
        updateTag(`organization-${activeOrg.id}`)
        updateTag(`organization-${activeOrg.id}-subscription`)
      }
      updateTag("permissions-all")
      updateTag("membership-current")
      updateTag("membership-current-role")

      return { success: true }
    } catch (error) {
      console.error("Error removing member:", error)
      Sentry.captureException(error, {
        tags: { section: "user-mutations" },
        extra: { memberId: id }
      })
      return {
        failure: {
          reason: "Error eliminando al miembro"
        }
      }
    }
  })

export async function ensureActiveOrganization() {
  const requestHeaders = await headers()

  const current = await auth.api
    .getFullOrganization({
      headers: requestHeaders
    })
    .catch(() => null)

  if (current?.id) {
    return current
  }

  const orgs = await auth.api.listOrganizations({
    headers: requestHeaders
  })

  if (!Array.isArray(orgs) || orgs.length === 0) {
    return null
  }

  const firstOrgId = orgs[0]?.id
  if (!firstOrgId) {
    return null
  }

  await auth.api.setActiveOrganization({
    body: { organizationId: firstOrgId },
    headers: requestHeaders
  })

  updateTag("organization:current")
  updateTag("organization-current")
  updateTag("organizations-list")
  updateTag("membership:current")
  updateTag("membership-current")
  updateTag("permissions:all")
  updateTag("permissions-all")

  return auth.api.getFullOrganization({
    headers: requestHeaders
  })
}
