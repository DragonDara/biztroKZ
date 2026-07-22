"use client"

import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { BorderBeam } from "border-beam"
import { AlertCircle, FileSpreadsheet, FileText, Loader } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import Papa from "papaparse"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { bulkCreateItems } from "@/server/actions/item/mutations"
import { MenuItemStatus, type BulkMenuItem } from "@/lib/types/menu-item"

type CSVRow = {
  nombre: string
  variante?: string
  descripcion?: string
  precio: string
  categoria?: string
  moneda?: string
}

type ImportError = {
  row: number
  errors: string[]
}

type ImportValidationKey =
  "nameRequired" | "priceRequired" | "priceInvalid" | "currencyInvalid"

function downloadCsvFile(rows: CSVRow[], fileName: string) {
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

function validateRow(
  row: CSVRow,
  t: (key: ImportValidationKey) => string
): string[] {
  const errors: string[] = []

  if (!row.nombre?.trim()) {
    errors.push(t("nameRequired"))
  }

  if (!row.precio) {
    errors.push(t("priceRequired"))
  } else {
    const price = parseFloat(row.precio)
    if (isNaN(price) || price < 0) {
      errors.push(t("priceInvalid"))
    }
  }

  if (row.moneda) {
    const currency = row.moneda.trim().toUpperCase()
    if (!["MXN", "USD", "KZT"].includes(currency)) {
      errors.push(t("currencyInvalid"))
    }
  }

  return errors
}

export default function MenuImportOptions({
  aiImportHref,
  onCsvSuccess
}: {
  aiImportHref: string
  onCsvSuccess?: (createdCount: number) => void
}) {
  const t = useTranslations("dashboard.menuItems.import.options")
  const tValidation = useTranslations(
    "dashboard.menuItems.import.options.validation"
  )
  const [errors, setErrors] = useState<ImportError[]>([])

  const templateRows = useMemo<CSVRow[]>(
    () => [
      {
        nombre: t("template.productName"),
        variante: t("template.variantRegular"),
        descripcion: t("template.description"),
        precio: "100.00",
        categoria: t("template.category"),
        moneda: "KZT"
      },
      {
        nombre: t("template.productName"),
        variante: t("template.variantLarge"),
        descripcion: t("template.description"),
        precio: "120.00",
        categoria: t("template.category"),
        moneda: "KZT"
      }
    ],
    [t]
  )

  const { execute, isPending, reset } = useAction(bulkCreateItems, {
    onSuccess: response => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        reset()
        return
      }

      const createdCount = response.data?.success?.length ?? 0
      toast.success(t("importSuccess", { count: createdCount }))
      setErrors([])
      onCsvSuccess?.(createdCount)
      reset()
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "item-import" }
      })
      toast.error(t("importError"))
      reset()
    }
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setErrors([])

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "utf-8",
      complete: results => {
        if (results.data.length === 0) {
          setErrors([{ row: 0, errors: [tValidation("emptyFile")] }])
          return
        }

        if (results.data.length > 200) {
          setErrors([{ row: 0, errors: [tValidation("maxRows")] }])
          return
        }

        const foundErrors: ImportError[] = []
        const validItems: BulkMenuItem[] = []

        results.data.forEach((row, index) => {
          const rowErrors = validateRow(row, key => tValidation(key))

          if (rowErrors.length > 0) {
            foundErrors.push({
              row: index + 1,
              errors: rowErrors
            })
            return
          }

          const currency = (row.moneda ?? "KZT").trim().toUpperCase()

          validItems.push({
            name: row.nombre,
            variantName: row.variante?.trim() || undefined,
            description: row.descripcion,
            price: parseFloat(row.precio),
            status: MenuItemStatus.ACTIVE,
            category: row.categoria,
            currency:
              currency === "USD" ? "USD" : currency === "MXN" ? "MXN" : "KZT"
          })
        })

        if (foundErrors.length > 0) {
          setErrors(foundErrors)
          return
        }

        execute(validItems)
      },
      error: error => {
        setErrors([
          {
            row: 0,
            errors: [tValidation("csvParseError", { message: error.message })]
          }
        ])
      }
    })
  }

  return (
    <div className="relative space-y-4">
      {isPending && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center
            justify-center gap-2 rounded-lg bg-white/80 text-gray-900
            backdrop-blur dark:bg-gray-950/80 dark:text-gray-100"
        >
          <Loader className="size-6 animate-spin" />
          <p className="text-sm font-medium">{t("importing")}</p>
        </div>
      )}
      <BorderBeam size="pulse-outside" colorVariant="colorful" strength={0.5}>
        <div
          className="bg-background relative rounded-2xl p-4 ring-1 ring-black/10
            dark:ring-white/15"
        >
          <div className="mb-3 flex items-start gap-3">
            <FileText className="text-muted-foreground size-5" />
            <div>
              <p className="font-medium">{t("aiTitle")}</p>
              <p className="text-muted-foreground text-sm text-pretty">
                {t("aiDescription")}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" disabled={isPending}>
            <Link href={aiImportHref} prefetch={false}>
              {t("aiButton")}
            </Link>
          </Button>
        </div>
      </BorderBeam>

      <div
        className="border-border/60 bg-background rounded-2xl border p-5
          shadow-sm"
      >
        <div className="mb-3 flex items-start gap-3">
          <FileSpreadsheet className="text-muted-foreground size-5" />
          <div>
            <p className="font-medium">{t("csvTitle")}</p>
            <p className="text-muted-foreground text-sm text-pretty">
              {t("csvDescription")}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full justify-start sm:w-fit"
            onClick={() =>
              downloadCsvFile(templateRows, "plantilla-productos.csv")
            }
            disabled={isPending}
          >
            <FileSpreadsheet className="mr-1" />
            {t("downloadTemplate")}
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">{t("uploadCsv")}</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isPending}
              aria-busy={isPending}
              className="border-border bg-background file:bg-primary
                file:text-primary-foreground hover:file:bg-primary/90
                focus-visible:ring-ring block w-full cursor-pointer rounded-lg
                border text-sm shadow-sm file:mr-4 file:cursor-pointer
                file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm
                file:font-semibold focus-visible:ring-2
                focus-visible:ring-offset-2 focus-visible:outline-none
                disabled:cursor-not-allowed disabled:opacity-60
                motion-safe:transition-colors"
            />
          </div>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("fileErrorsTitle")}</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc">
                {errors.map((error, index) => (
                  <li key={`${error.row}-${index}`}>
                    {t("rowError", {
                      row: error.row,
                      errors: error.errors.join(", ")
                    })}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
