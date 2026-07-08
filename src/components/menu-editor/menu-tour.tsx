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
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { tourModeAtom } from "@/lib/atoms"

export default function MenuTour() {
  const t = useTranslations("menuEditor.tour")
  const [tourMode, setTourMode] = useAtom(tourModeAtom)
  const [isMounted, setIsMounted] = useState(false)

  const steps = useMemo<Step[]>(
    () => [
      {
        target: ".editor-categories",
        title: t("steps.categories.title"),
        content: t("steps.categories.content"),
        placement: "right"
      },
      {
        target: ".editor-elements",
        title: t("steps.elements.title"),
        content: t("steps.elements.content"),
        placement: "right"
      },
      {
        target: ".editor-layers",
        title: t("steps.layers.title"),
        content: t("steps.layers.content"),
        placement: "right"
      },
      {
        target: ".editor-size",
        title: t("steps.preview.title"),
        content: t("steps.preview.content"),
        placement: "left",
        beaconPlacement: "top"
      },
      {
        target: ".editor-toolbar",
        title: t("steps.toolbar.title"),
        content: t("steps.toolbar.content"),
        placement: "top-end",
        beaconPlacement: "top"
      },
      {
        target: ".editor-theme",
        title: t("steps.theme.title"),
        content: t.rich("steps.theme.content", {
          strong: chunks => <strong>{chunks}</strong>
        }),
        placement: "left",
        beaconPlacement: "left-start"
      },
      {
        target: ".editor-settings",
        title: t("steps.settings.title"),
        content: t("steps.settings.content"),
        placement: "left",
        beaconPlacement: "left-start"
      },
      {
        target: ".editor-published",
        title: t("steps.publish.title"),
        content: t("steps.publish.content"),
        placement: "bottom-end"
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
      continuous
      options={{
        showProgress: true,
        buttons: ["back", "skip", "primary"]
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
  const t = useTranslations("menuEditor.tour")

  return (
    <div
      {...tooltipProps}
      className="max-w-96 rounded-lg border border-transparent bg-white p-4
        shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="mb-2 font-medium">{step.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{step.content}</p>
      <div className="mt-8 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {t("progress", { current: index + 1, total: size })}
        </div>
        <div className="flex justify-end gap-x-2">
          {!isLastStep && (
            <Button {...skipProps} variant="ghost" size="xs">
              {t("skip")}
            </Button>
          )}
          {index > 0 && (
            <Button {...backProps} variant="outline" size="xs">
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
