import {
  inferOrgAdditionalFields,
  organizationClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"
import { organizationRoles } from "@/lib/auth-permissions"

export const authClient = createAuthClient({
  plugins: [
    // Add any necessary plugins here
    organizationClient({
      roles: organizationRoles,
      schema: inferOrgAdditionalFields<typeof auth>()
    })
  ]
})
export const { signIn, signUp, useSession, signOut } = authClient
