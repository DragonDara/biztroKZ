"use client"

import { useEffect, useState } from "react"
import { useEditor } from "@craftjs/core"
import { useAtom } from "jotai"
import {
  Clipboard,
  ClipboardPaste,
  Lock,
  LockOpen,
  Monitor,
  Redo2,
  TabletSmartphone,
  Undo2
} from "lucide-react"
import { useTranslations } from "next-intl"

import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import { useSetUnsavedChanges } from "@/components/dashboard/unsaved-changes-provider"
import { useMenuEditorUnsavedCopy } from "@/components/menu-editor/use-menu-editor-unsaved"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { elementPropsAtom, frameSizeAtom } from "@/lib/atoms"
import { FrameSize } from "@/lib/types/theme"

export default function FloatingBar() {
  const t = useTranslations("menuEditor.toolbar")
  const unsavedCopy = useMenuEditorUnsavedCopy()
  const { enabled, canUndo, canRedo, actions, query, selectedNodeId, store } =
    useEditor((state, query) => ({
      enabled: state.options.enabled,
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo(),
      selectedNodeId: state.events.selected
    }))
  const [propsCopy, setPropsCopy] = useAtom(elementPropsAtom)

  const [historyPointer, setHistoryPointer] = useState(store.history.pointer)

  useEffect(() => {
    return store.subscribe(_state => store.history.pointer, setHistoryPointer)
  }, [store])

  const onPasteProps = (clonedProps: unknown) => {
    const values = selectedNodeId.values()
    const nodeId = values.next()
    if (nodeId.value) {
      actions.setProp(nodeId.value, props => {
        return (props = Object.assign(props, clonedProps))
      })
    }
  }

  const onCopyProps = () => {
    const values = selectedNodeId.values()
    const nodeId = values.next()
    if (selectedNodeId && nodeId.value) {
      const node = query.node(nodeId.value).get()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, text, ...props } = node.data.props
      setPropsCopy(props)
    }
  }

  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges()

  useEffect(() => {
    if (canUndo && historyPointer >= 0) {
      setUnsavedChanges({
        ...unsavedCopy.editorLeave,
        proceedAction: () => {
          actions.history.clear()
        }
      })
    } else {
      clearUnsavedChanges()
    }
  }, [
    setUnsavedChanges,
    clearUnsavedChanges,
    canUndo,
    historyPointer,
    actions.history,
    unsavedCopy.editorLeave
  ])

  const [frameSize, setFrameSize] = useAtom(frameSizeAtom)

  return (
    <div
      className="editor-toolbar fixed bottom-24 left-1/2 flex h-12
        -translate-x-1/2 flex-row items-center justify-between rounded-full
        bg-gray-800 px-1 text-white shadow-lg sm:bottom-8 sm:min-w-[200px]
        dark:border dark:border-gray-700 dark:bg-gray-900"
    >
      <TooltipHelper content={t("undo")}>
        <Button
          disabled={!canUndo}
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => actions.history.undo()}
        >
          <Undo2 className="size-4" />
        </Button>
      </TooltipHelper>
      <TooltipHelper content={t("redo")}>
        <Button
          disabled={!canRedo}
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => actions.history.redo()}
        >
          <Redo2 className="size-4" />
        </Button>
      </TooltipHelper>
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-6! bg-gray-600 sm:inline-flex"
      />
      <TooltipHelper
        content={
          frameSize === FrameSize.MOBILE
            ? t("switchToDesktop")
            : t("switchToMobile")
        }
      >
        <Button
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          onClick={() =>
            setFrameSize(
              FrameSize.DESKTOP === frameSize
                ? FrameSize.MOBILE
                : FrameSize.DESKTOP
            )
          }
        >
          {frameSize === FrameSize.MOBILE ? (
            <Monitor className="size-4" />
          ) : (
            <TabletSmartphone className="size-4" />
          )}
        </Button>
      </TooltipHelper>
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-6! bg-gray-600 sm:inline-flex"
      />
      <TooltipHelper content={t("copyStyle")}>
        <Button
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          onClick={() => onCopyProps()}
        >
          <Clipboard className="size-4" />
        </Button>
      </TooltipHelper>
      <TooltipHelper content={t("pasteStyle")}>
        <Button
          disabled={Object.keys(propsCopy).length === 0}
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          onClick={() => onPasteProps(propsCopy)}
        >
          <ClipboardPaste className="size-4" />
        </Button>
      </TooltipHelper>
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-6! bg-gray-600 sm:inline-flex"
      />
      <TooltipHelper content={enabled ? t("lockEditing") : t("unlockEditing")}>
        <Button
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          onClick={() =>
            actions.setOptions(options => (options.enabled = !enabled))
          }
        >
          {enabled ? (
            <LockOpen className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
        </Button>
      </TooltipHelper>
    </div>
  )
}
