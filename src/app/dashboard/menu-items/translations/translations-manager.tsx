"use client"

import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import {
  CircleFadingArrowUp,
  Languages,
  Loader,
  PlusCircle,
  Sparkles,
  Trash2
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useOptimisticAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
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
  translateMenuItems
} from "@/server/actions/item/translations"
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
  const [translatingLocale, setTranslatingLocale] = useState<string | null>(
    null
  )
  const [deletingLocale, setDeletingLocale] = useState<string | null>(null)
  const router = useRouter()

  type TranslationsState = {
    translations: AvailableTranslation[]
  }

  const languageNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "language" }),
    [locale]
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

  return (
    <div className="flex flex-col gap-10">
      <PageSubtitle>
        <PageSubtitle.Icon icon={Languages} />
        <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
        <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
        {availableToAdd.length > 0 && (
          <PageSubtitle.Actions>
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
          </PageSubtitle.Actions>
        )}
      </PageSubtitle>

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
