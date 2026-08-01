"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"

import { resolveBlockDisplayNameKey } from "@/lib/menu-editor/block-display-names"

export {
  BLOCK_DISPLAY_NAME,
  DISPLAY_NAME_ALIASES,
  canonicalizeBlockDisplayName,
  isBlockDisplayName,
  resolveBlockDisplayNameKey
} from "@/lib/menu-editor/block-display-names"
export type { BlockDisplayNameKey } from "@/lib/menu-editor/block-display-names"

export function useResolveBlockDisplayName() {
  const t = useTranslations("menuEditor.blocks.displayNames")

  return useCallback(
    (name: string | undefined) => {
      if (!name) return ""
      const key = resolveBlockDisplayNameKey(name)
      return key ? t(key) : name
    },
    [t]
  )
}
