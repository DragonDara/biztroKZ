"use client"

import { useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import {
  CircleFadingArrowUp,
  Download,
  Languages,
  Loader,
  PlusCircle,
  Sparkles,
  Trash2,
  Upload
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useAction, useOptimisticAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { TextMorph } from "torph/react"

import InfoHelper from "@/components/dashboard/info-helper"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { useProGuard } from "@/components/dashboard/upgrade-dialog"
import {
  Banner,
  BannerAction,
  BannerClose,
  BannerIcon,
  BannerTitle
} from "@/components/kibo-ui/banner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle
} from "@/components/ui/item"
import { LanguageFlag } from "@/components/ui/language-flag"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  deleteMenuTranslation,
  exportMenuTranslationsTemplate,
  importMenuTranslationsFromCsv,
  translateMenuItems
} from "@/server/actions/item/translations"
import {
  downloadMenuTranslationsCsvFile,
  normalizeMenuTranslationCsvRow,
  toLocalizedMenuTranslationCsvRow,
  type MenuTranslationCsvColumnLabels,
  type MenuTranslationCsvFields
} from "@/lib/menu-translations-csv"
import {
  SUPPORTED_LOCALES,
  type SupportedLocaleCode
} from "@/lib/types/translations"

type AvailableTranslation = {
  locale: SupportedLocaleCode
  count: number
}

type TranslationsManagerProps = {
  availableTranslations: AvailableTranslation[]
  isPro: boolean
}

export default function TranslationsManager({
  availableTranslations: initialTranslations,
  isPro
}: TranslationsManagerProps) {
  const t = useTranslations("dashboard.menuItems.translations")
  const tCommon = useTranslations("dashboard.common")
  const locale = useLocale()
  const [selectedLocale, setSelectedLocale] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importLocale, setImportLocale] = useState<string>("")
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [translatingLocale, setTranslatingLocale] = useState<string | null>(
    null
  )
  const [deletingLocale, setDeletingLocale] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  type TranslationsState = {
    translations: AvailableTranslation[]
  }

  const languageNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "language" }),
    [locale]
  )

  const csvColumnLabels: MenuTranslationCsvColumnLabels = useMemo(
    () => ({
      type: t("csvColumns.type"),
      id: t("csvColumns.id"),
      sourceName: t("csvColumns.sourceName"),
      sourceDescription: t("csvColumns.sourceDescription"),
      translatedName: t("csvColumns.translatedName"),
      translatedDescription: t("csvColumns.translatedDescription")
    }),
    [t]
  )

  const { guard: guardTranslation, dialog: upgradeDialog } = useProGuard(
    isPro,
    {
      title: t("upgradeTitle"),
      description: t("upgradeDescription")
    }
  )

  function getLocaleLabel(code?: string | null) {
    if (!code) return ""

    return languageNames.of(code) ?? code
  }

  const {
    execute: executeExport,
    isPending: isExporting,
    reset: resetExport
  } = useAction(exportMenuTranslationsTemplate, {
    onSuccess: response => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        resetExport()
        return
      }

      const rows = response.data?.success?.rows ?? []
      if (rows.length === 0) {
        toast.error(t("exportEmpty"))
        resetExport()
        return
      }

      const csvRows = rows.map(row =>
        toLocalizedMenuTranslationCsvRow(
          {
            type: row.type,
            id: row.id,
            sourceName: row.sourceName,
            sourceDescription: row.sourceDescription,
            translatedName: row.translatedName,
            translatedDescription: row.translatedDescription
          },
          csvColumnLabels
        )
      )

      downloadMenuTranslationsCsvFile(csvRows, t("exportFileName"))
      toast.success(t("exportSuccess", { count: rows.length }))
      resetExport()
    },
    onError: (error: unknown) => {
      Sentry.captureException(error, {
        tags: { section: "export-menu-translations" }
      })
      toast.error(t("exportError"))
      resetExport()
    }
  })

  const {
    execute: executeImport,
    isPending: isImporting,
    reset: resetImport
  } = useAction(importMenuTranslationsFromCsv, {
    onSuccess: response => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        resetImport()
        return
      }

      const failedCount = response.data?.failedRows?.length ?? 0
      const success = response.data?.success
      const localeName = getLocaleLabel(success?.locale ?? importLocale)

      if (success) {
        toast.success(
          t("importSuccess", {
            count: success.count,
            locale: localeName
          })
        )
      }

      if (failedCount > 0) {
        toast.error(t("importPartialErrors", { count: failedCount }))
      }

      resetImport()
      router.refresh()
      setImportDialogOpen(false)
      setImportLocale("")
      setImportErrors([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    onError: (error: unknown) => {
      Sentry.captureException(error, {
        tags: { section: "import-menu-translations" }
      })
      toast.error(t("importError"))
      resetImport()
    }
  })

  const {
    execute: executeTranslate,
    reset: resetTranslate,
    optimisticState: translateOptimisticState
  } = useOptimisticAction(translateMenuItems, {
    currentState: {
      translations: initialTranslations
    },
    updateFn: (state, { locale: nextLocale }) => {
      const existingTranslation = state.translations.find(
        translation => translation.locale === nextLocale
      )

      const nextTranslations = existingTranslation
        ? state.translations.map(translation =>
            translation.locale === nextLocale
              ? { ...translation, count: translation.count }
              : translation
          )
        : [...state.translations, { locale: nextLocale, count: 0 }]

      return {
        translations: nextTranslations
      }
    },
    onSuccess: (response: {
      data?: {
        failure?: { reason: string }
        success?: { locale?: string; count?: number }
      }
    }) => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        resetTranslate()
        setTranslatingLocale(null)
        return
      }

      const { locale: successLocale, count } = response.data?.success ?? {}
      const localeName = getLocaleLabel(successLocale)

      toast.success(
        t("translateSuccess", { count: count ?? 0, locale: localeName })
      )
      resetTranslate()
      router.refresh()
      setTranslatingLocale(null)
      setDialogOpen(false)
      setSelectedLocale("")
    },
    onError: (error: unknown) => {
      Sentry.captureException(error, { tags: { section: "translate-menu" } })
      toast.error(t("translateError"))
      resetTranslate()
      setTranslatingLocale(null)
    }
  })

  const {
    execute: executeDelete,
    reset: resetDelete,
    optimisticState: deleteOptimisticState
  } = useOptimisticAction(deleteMenuTranslation, {
    currentState: translateOptimisticState as TranslationsState,
    updateFn: (state, { locale: nextLocale }) => {
      return {
        translations: state.translations.filter(
          translation => translation.locale !== nextLocale
        )
      }
    },
    onSuccess: (response: {
      data?: {
        failure?: { reason: string }
      }
    }) => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        resetDelete()
        setDeletingLocale(null)
        return
      }

      const localeName = getLocaleLabel(deletingLocale)
      toast.success(t("deleteSuccess", { locale: localeName }))
      resetDelete()
      router.refresh()
      setDeletingLocale(null)
    },
    onError: (error: unknown) => {
      Sentry.captureException(error, {
        tags: { section: "delete-translation" }
      })
      toast.error(t("deleteError"))
      resetDelete()
      setDeletingLocale(null)
    }
  })

  const translations = deleteOptimisticState.translations

  const existingLocales = new Set(translations.map(item => item.locale))
  const availableToAdd = SUPPORTED_LOCALES.filter(
    item => !existingLocales.has(item.code)
  ).map(item => ({
    code: item.code,
    label: getLocaleLabel(item.code)
  }))

  const isTranslating = translatingLocale !== null
  const isDeleting = deletingLocale !== null

  const translateSelectLocales =
    isTranslating && selectedLocale
      ? [
          {
            code: selectedLocale,
            label: `${getLocaleLabel(selectedLocale)} ${t("translatingSuffix")}`
          },
          ...availableToAdd.filter(item => item.code !== selectedLocale)
        ]
      : availableToAdd

  const handleTranslate = () => {
    if (!selectedLocale) return
    setTranslatingLocale(selectedLocale)
    executeTranslate({ locale: selectedLocale as SupportedLocaleCode })
  }

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!importLocale) {
      setImportErrors([t("importValidation.selectLanguage")])
      event.target.value = ""
      return
    }

    setImportErrors([])

    Papa.parse<Record<string, string | undefined>>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "utf-8",
      transformHeader: header =>
        header
          .replace(/^\uFEFF/, "")
          .trim()
          .toLocaleLowerCase(),
      complete: results => {
        if (results.data.length === 0) {
          setImportErrors([t("importValidation.emptyFile")])
          return
        }

        const parseErrors: string[] = []
        const validRows: Array<{
          type: MenuTranslationCsvFields["type"]
          id: string
          translatedName: string
          translatedDescription?: string
        }> = []

        results.data.forEach((rawRow, index) => {
          const row = normalizeMenuTranslationCsvRow(rawRow, csvColumnLabels)
          const translatedName = row.translatedName?.trim() ?? ""

          // Empty translation cells are skipped (template rows still unfilled).
          if (!translatedName) return

          if (!row.type) {
            parseErrors.push(
              t("importValidation.invalidType", { row: index + 1 })
            )
            return
          }

          if (!row.id?.trim()) {
            parseErrors.push(
              t("importValidation.idRequired", { row: index + 1 })
            )
            return
          }

          validRows.push({
            type: row.type,
            id: row.id.trim(),
            translatedName,
            translatedDescription: row.translatedDescription?.trim() || undefined
          })
        })

        if (parseErrors.length > 0) {
          setImportErrors(parseErrors.slice(0, 10))
          return
        }

        if (validRows.length === 0) {
          setImportErrors([t("importValidation.noTranslatedRows")])
          return
        }

        executeImport({
          locale: importLocale as SupportedLocaleCode,
          rows: validRows
        })
      },
      error: error => {
        setImportErrors([
          t("importValidation.csvParseError", { message: error.message })
        ])
      }
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <PageSubtitle>
        <PageSubtitle.Icon icon={Languages} />
        <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
        <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
        <PageSubtitle.Actions>
          <Button
            variant="outline"
            className="gap-2"
            disabled={isExporting || isImporting || isTranslating}
            onClick={() => executeExport()}
          >
            {isExporting ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {t("exportCsv")}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled={isExporting || isImporting || isTranslating}
            onClick={() =>
              guardTranslation(() => {
                setImportErrors([])
                setImportDialogOpen(true)
              })
            }
          >
            <Upload className="size-4" />
            {t("importCsv")}
          </Button>
          {availableToAdd.length > 0 && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button
                variant="default"
                className="gap-2"
                onClick={() => guardTranslation(() => setDialogOpen(true))}
              >
                <PlusCircle className="size-4" />
                {t("addLanguage")}
              </Button>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>{t("dialogTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("dialogDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <Select
                    value={selectedLocale}
                    onValueChange={setSelectedLocale}
                    disabled={isTranslating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isTranslating && selectedLocale
                            ? `${getLocaleLabel(selectedLocale)} ${t("translatingSuffix")}`
                            : t("selectLanguage")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {translateSelectLocales.map(item => (
                        <SelectItem key={item.code} value={item.code}>
                          <span className="flex items-center gap-2">
                            <LanguageFlag locale={item.code} />
                            <span>{item.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      setSelectedLocale("")
                    }}
                    disabled={isTranslating}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    onClick={handleTranslate}
                    disabled={!selectedLocale || isTranslating}
                  >
                    {isTranslating ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4 fill-current" />
                    )}
                    <TextMorph>
                      {isTranslating ? t("translating") : t("translateWithAi")}
                    </TextMorph>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </PageSubtitle.Actions>
      </PageSubtitle>

      <Dialog
        open={importDialogOpen}
        onOpenChange={open => {
          setImportDialogOpen(open)
          if (!open) {
            setImportLocale("")
            setImportErrors([])
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("importDialogTitle")}</DialogTitle>
            <DialogDescription>{t("importDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <Select
              value={importLocale}
              onValueChange={setImportLocale}
              disabled={isImporting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LOCALES.map(item => (
                  <SelectItem key={item.code} value={item.code}>
                    <span className="flex items-center gap-2">
                      <LanguageFlag locale={item.code} />
                      <span>{getLocaleLabel(item.code)}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                disabled={isImporting || !importLocale}
                onChange={handleImportFile}
              />
              <Button
                variant="outline"
                className="gap-2"
                disabled={isImporting || !importLocale}
                onClick={() => fileInputRef.current?.click()}
              >
                {isImporting ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {isImporting ? t("importing") : t("chooseCsvFile")}
              </Button>
              <p className="text-muted-foreground text-xs">
                {t("importHint")}
              </p>
            </div>
            {importErrors.length > 0 && (
              <ul className="text-destructive list-disc space-y-1 pl-4 text-sm">
                {importErrors.map(error => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isImporting}
              onClick={() => setImportDialogOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isPro && availableToAdd.length > 0 && (
        <Banner
          inset
          className="bg-linear-to-r/oklch from-indigo-500 to-pink-500
            text-white"
        >
          <BannerIcon
            icon={CircleFadingArrowUp}
            className="border-white/20 bg-white/10 text-white"
          />
          <BannerTitle>{t("bannerTitle")}</BannerTitle>
          <BannerAction
            asChild
            className="border-white/20 bg-white/10 text-white hover:bg-white/20
              hover:text-white"
          >
            <a href="mailto:contacto@biztro.co">{t("upgradeCta")}</a>
          </BannerAction>
          <BannerClose
            aria-label={t("closeBanner")}
            className="text-white hover:bg-white/20 hover:text-white"
          />
        </Banner>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h2 className="text-base leading-5 font-semibold">
              {t("availableLanguages")}
            </h2>
            <InfoHelper>{t("availableLanguagesInfo")}</InfoHelper>
          </div>
        </div>

        {translations.length === 0 ? (
          <Empty className="border-border bg-muted/20 rounded-xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Languages />
              </EmptyMedia>
              <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="gap-4">
            {translations.map(translation => {
              const localeLabel = getLocaleLabel(translation.locale)
              return (
                <Item key={translation.locale} variant="outline">
                  <ItemContent>
                    <ItemTitle>
                      <LanguageFlag locale={translation.locale} />
                      {localeLabel}
                    </ItemTitle>
                    <ItemDescription>
                      {t("productCount", { count: translation.count })}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      disabled={isTranslating || isDeleting}
                      onClick={() => {
                        setTranslatingLocale(translation.locale)
                        executeTranslate({
                          locale: translation.locale as SupportedLocaleCode
                        })
                      }}
                    >
                      {translatingLocale === translation.locale ? (
                        <Loader className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4 fill-current" />
                      )}
                      {t("update")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting || isTranslating}
                      onClick={() => {
                        setDeletingLocale(translation.locale)
                        executeDelete({ locale: translation.locale })
                      }}
                      aria-label={t("deleteAria", { locale: localeLabel })}
                    >
                      {deletingLocale === translation.locale ? (
                        <Loader className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </ItemActions>
                </Item>
              )
            })}
          </ItemGroup>
        )}
      </div>

      {upgradeDialog}
    </div>
  )
}
