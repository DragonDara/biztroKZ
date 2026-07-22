"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Joyride,
  type BeaconRenderProps,
  type EventData,
  type Step,
  type TooltipRenderProps
} from "react-joyride"
import { useAtom } from "jotai"
import { Check, Play, QrCode } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { tourModeAtom } from "@/lib/atoms"

export default function MenuTourMobile() {
  const t = useTranslations("menuEditor.tourMobile")
  const [tourMode, setTourMode] = useAtom(tourModeAtom)
  const [isMounted, setIsMounted] = useState(false)

  const steps = useMemo<Step[]>(
    () => [
      {
        target: ".editor-topbar",
        title: t("steps.topbar.title"),
        content: (
          <div>
            {t("steps.topbar.intro")}
            <ul className="my-4 space-y-3">
              <li className="flex items-center gap-2">
                <Play className="size-4 text-orange-400 dark:text-white" />
                <span>{t("steps.topbar.previewItem")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-green-400 dark:text-white" />
                <span>{t("steps.topbar.saveItem")}</span>
              </li>
              <li className="flex items-center gap-2">
                <QrCode className="size-4 text-blue-400 dark:text-white" />
                <span>{t("steps.topbar.qrItem")}</span>
              </li>
              <li className="flex items-center gap-2">
                <strong className="dark:text-white">
                  {t("steps.topbar.publishLabel")}
                </strong>
                <span>{t("steps.topbar.publishItem")}</span>
              </li>
            </ul>
          </div>
        ),
        placement: "bottom"
      },
      {
        target: ".editor-toolbar",
        title: t("steps.toolbar.title"),
        content: t("steps.toolbar.content"),
        placement: "top"
      },
      {
        target: ".editor-bottombar",
        title: t("steps.bottombar.title"),
        content: (
          <div>
            {t("steps.bottombar.intro")}
            <ul className="mt-2 space-y-2">
              <li className="flex flex-col gap-2">
                <strong className="text-white">
                  {t("steps.bottombar.elementsLabel")}
                </strong>
                <span>{t("steps.bottombar.elementsContent")}</span>
              </li>
              <li className="flex flex-col gap-2">
                <strong className="text-white">
                  {t("steps.bottombar.themesLabel")}
                </strong>
                <span>{t("steps.bottombar.themesContent")}</span>
              </li>
              <li className="flex flex-col gap-2">
                <strong className="text-white">
                  {t("steps.bottombar.sectionsLabel")}
                </strong>
                <span>{t("steps.bottombar.sectionsContent")}</span>
              </li>
              <li className="flex flex-col gap-2">
                <strong className="text-white">
                  {t("steps.bottombar.settingsLabel")}
                </strong>
                <span>{t("steps.bottombar.settingsContent")}</span>
              </li>
            </ul>
          </div>
        ),
        placement: "top"
      }
    ],
    [t]
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCallback = (data: EventData) => {
    if (data.status === "finished" || data.status === "skipped") {
      setTourMode(false)
    }
  }

  if (!isMounted) return null

  return (
    <Joyride
      run={tourMode}
      onEvent={handleCallback}
      steps={steps}
      options={{
        showProgress: true,
        buttons: ["back", "skip", "primary"],
        zIndex: 1000
      }}
      beaconComponent={Beacon}
      tooltipComponent={props => <Tooltip {...props} />}
      floatingOptions={{
        hideArrow: true
      }}
      locale={{
        back: t("back"),
        close: t("close"),
        last: t("last"),
        next: t("next"),
        skip: t("skip"),
        open: t("openHelp")
      }}
    />
  )
}

function Tooltip({
  backProps,
  index,
  size,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  tooltipProps
}: TooltipRenderProps) {
  const t = useTranslations("menuEditor.tourMobile")

  return (
    <div
      {...tooltipProps}
      className="max-w-80 rounded-lg border border-transparent bg-white p-4
        shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="mb-2 font-medium">{step.title}</h3>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {step.content}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {t("progress", { current: index + 1, total: size })}
        </div>
        <div className="flex justify-end gap-x-2">
          {!isLastStep && (
            <Button {...skipProps} variant="link" size="xs">
              {t("skip")}
            </Button>
          )}
          {index > 0 && (
            <Button {...backProps} variant="secondary" size="xs">
              {t("back")}
            </Button>
          )}
          <Button {...primaryProps} size="xs">
            {isLastStep ? t("finish") : t("next")}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Beacon({
  continuous: _continuous,
  index: _index,
  isLastStep: _isLastStep,
  size: _size,
  step: _step
}: BeaconRenderProps) {
  return (
    <div className="relative">
      <span
        className="absolute -top-1 -left-1 size-8 animate-ping rounded-full
          bg-blue-400"
      />
      <span
        className="absolute inset-auto inline-block size-6 rounded-full
          bg-blue-500 ring-4 ring-blue-400"
      />
    </div>
  )
}
