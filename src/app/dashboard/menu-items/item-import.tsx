"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { ChevronDown, Download, Loader, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { exportMenuItems } from "@/server/actions/item/mutations"
import { useIsMobile } from "@/hooks/use-mobile"
import MenuImportOptions from "@/app/dashboard/menu-items/import-options"

function downloadCsvFile(
  rows: Array<Record<string, string | undefined>>,
  fileName: string
) {
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function ItemImport() {
  const t = useTranslations("dashboard.menuItems.products")
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const {
    execute: exportItems,
    isPending: isExporting,
    reset: resetExport
  } = useAction(exportMenuItems, {
    onSuccess: response => {
      const items = response.data?.success ?? []
      if (items.length === 0) {
        toast.error(t("exportEmpty"))
        resetExport()
        return
      }

      const csvRows = items.flatMap(item => {
        const variants = item.variants?.length
          ? item.variants
          : [{ name: "Regular", price: 0 }]

        return variants.map(variant => {
          const validPrice =
            typeof variant.price === "number" && !isNaN(variant.price)
              ? variant.price
              : 0

          return {
            nombre: item.name,
            variante: variant.name,
            descripcion: item.description ?? "",
            precio: validPrice.toFixed(2),
            categoria: item.category?.name,
            moneda: item.currency ?? "KZT"
          }
        })
      })

      downloadCsvFile(csvRows, "productos-exportados-con-variantes.csv")
      toast.success(t("exportSuccess"))
      resetExport()
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "item-export" }
      })
      toast.error(t("exportError"))
      resetExport()
    }
  })

  const handleExportMenu = async () => {
    await exportItems()
  }

  if (isMobile) {
    return null
  }

  return (
    <>
      <ButtonGroup className="gap-0">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setOpen(true)
          }}
          disabled={isExporting}
        >
          <Upload className="size-4" />
          {t("import")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("moreActions")}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={handleExportMenu}
              disabled={isExporting}
            >
              <Download className="size-4" />
              {t("export")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-balance">
              {t("importTitle")}
            </DialogTitle>
            <DialogDescription className="text-pretty">
              {t("importDescription")}
            </DialogDescription>
          </DialogHeader>
          <MenuImportOptions
            aiImportHref="/dashboard/menu-items/menu-import"
            onCsvSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
