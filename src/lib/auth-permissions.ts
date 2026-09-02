import {
  adminAc,
  defaultAc,
  memberAc,
  ownerAc
} from "better-auth/plugins/organization/access"

export const organizationMemberRole = defaultAc.newRole({
  ...memberAc.statements,
  organization: ["update"]
})

export const organizationRoles = {
  owner: ownerAc,
  admin: adminAc,
  member: organizationMemberRole
}
