import { z } from "zod/v4"

export const categorySchema = z.object({
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
  organizationId: z.string().optional(),
  menuSectionId: z.string().nullish(),
  updatePublishedMenus: z.boolean().optional(),
  rememberPublishedChoice: z.boolean().optional()
})

export const menuSectionSchema = z.object({
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
  organizationId: z.string().optional(),
  updatePublishedMenus: z.boolean().optional(),
  rememberPublishedChoice: z.boolean().optional()
})

export const menuSectionCoverSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  updatePublishedMenus: z.boolean().optional(),
  rememberPublishedChoice: z.boolean().optional()
})

export const enum ActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}
