import { z } from "zod/v4"

import { OrganizationStatus } from "@/lib/types/plan"

export const orgSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Name is required" : undefined
    })
    .min(3, {
      error: "Name is too short"
    })
    .max(100, {
      error: "Name is too long"
    }),
  description: z.string().optional(),
  logo: z.url().optional(),
  banner: z.url().optional(),
  status: z.enum(OrganizationStatus),
  plan: z.enum(["BASIC", "PRO"]),
  subdomain: z
    .string()
    .min(3, {
      error: "Subdomain is too short"
    })
    .trim()
    .regex(/^[a-z0-9-]+$/i, {
      error: "Only letters, numbers, and hyphens are allowed"
    })
    .optional(),
  slug: z
    .string()
    .min(3, {
      error: "Subdomain is too short"
    })
    .trim()
    .regex(/^[a-z0-9-]+$/i, {
      error: "Only letters, numbers, and hyphens are allowed"
    })
})

export const enum MembershipRole {
  ADMIN = "admin",
  MEMBER = "member",
  OWNER = "owner"
}
