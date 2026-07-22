"use client"

import { useTranslations } from "next-intl"

const CANONICAL_DISPLAY_NAMES = {
  Sitio: "site",
  Cabecera: "header",
  Categoría: "category",
  Producto: "product",
  Navegación: "navigation",
  Recomendados: "featured",
  Encabezado: "heading",
  Texto: "text"
} as const

export function useResolveBlockDisplayName() {
  const t = useTranslations("menuEditor.blocks.displayNames")

  return (name: string | undefined) => {
    if (!name) return ""
    const key =
      CANONICAL_DISPLAY_NAMES[name as keyof typeof CANONICAL_DISPLAY_NAMES]
    return key ? t(key) : name
  }
}
