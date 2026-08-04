"use client"

import * as React from "react"
import { useDirection } from "@radix-ui/react-direction"
import { SearchIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"

const SHORTCUT_KEY = "/"

interface ShortcutGroup {
  title: string
  shortcuts: Array<{
    keys: string[]
    description: string
  }>
}

interface DataGridKeyboardShortcutsProps {
  enableSearch?: boolean
  enableUndoRedo?: boolean
  enablePaste?: boolean
  enableRowAdd?: boolean
  enableRowsDelete?: boolean
}

export const DataGridKeyboardShortcuts = React.memo(
  DataGridKeyboardShortcutsImpl,
  (prev, next) => {
    return (
      prev.enableSearch === next.enableSearch &&
      prev.enableUndoRedo === next.enableUndoRedo &&
      prev.enablePaste === next.enablePaste &&
      prev.enableRowAdd === next.enableRowAdd &&
      prev.enableRowsDelete === next.enableRowsDelete
    )
  }
)

function DataGridKeyboardShortcutsImpl({
  enableSearch = false,
  enableUndoRedo = false,
  enablePaste = false,
  enableRowAdd = false,
  enableRowsDelete = false
}: DataGridKeyboardShortcutsProps) {
  const t = useTranslations("menuEditor.dataGrid.shortcuts")
  const dir = useDirection()
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isMac =
    typeof navigator !== "undefined"
      ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
      : false

  const modKey = isMac ? "⌘" : "Ctrl"

  const onOpenChange = React.useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setInput("")
    }
  }, [])

  const onOpenAutoFocus = React.useCallback((event: Event) => {
    event.preventDefault()
    inputRef.current?.focus()
  }, [])

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value)
    },
    []
  )

  const shortcutGroups: ShortcutGroup[] = React.useMemo(
    () => [
      {
        title: t("groups.navigation"),
        shortcuts: [
          {
            keys: ["↑", "↓", "←", "→"],
            description: t("navigateCells")
          },
          {
            keys: ["Tab"],
            description: t("nextCell")
          },
          {
            keys: ["Shift", "Tab"],
            description: t("previousCell")
          },
          {
            keys: ["Home"],
            description: t("firstColumn")
          },
          {
            keys: ["End"],
            description: t("lastColumn")
          },
          {
            keys: [modKey, "↑"],
            description: t("firstRowSameColumn")
          },
          {
            keys: [modKey, "↓"],
            description: t("lastRowSameColumn")
          },
          {
            keys: [modKey, "←"],
            description: t("firstColumnSameRow")
          },
          {
            keys: [modKey, "→"],
            description: t("lastColumnSameRow")
          },
          {
            keys: [modKey, "Home"],
            description: t("firstCell")
          },
          {
            keys: [modKey, "End"],
            description: t("lastCell")
          },
          {
            keys: ["PgUp"],
            description: t("pageUp")
          },
          {
            keys: ["PgDn"],
            description: t("pageDown")
          },
          {
            keys: ["⌥", "↑"],
            description: t("scrollUpPage")
          },
          {
            keys: ["⌥", "↓"],
            description: t("scrollDownPage")
          },
          {
            keys: ["⌥", "PgUp"],
            description: t("scrollColumnsLeftPage")
          },
          {
            keys: ["⌥", "PgDn"],
            description: t("scrollColumnsRightPage")
          }
        ]
      },
      {
        title: t("groups.selection"),
        shortcuts: [
          {
            keys: ["Shift", "↑↓←→"],
            description: t("extendSelection")
          },
          {
            keys: [modKey, "Shift", "↑"],
            description: t("selectToTop")
          },
          {
            keys: [modKey, "Shift", "↓"],
            description: t("selectToBottom")
          },
          {
            keys: [modKey, "Shift", "←"],
            description: t("selectToFirstColumn")
          },
          {
            keys: [modKey, "Shift", "→"],
            description: t("selectToLastColumn")
          },
          {
            keys: [modKey, "A"],
            description: t("selectAllCells")
          },
          {
            keys: [modKey, "Click"],
            description: t("toggleCellSelection")
          },
          {
            keys: ["Shift", "Click"],
            description: t("selectRange")
          },
          {
            keys: ["Esc"],
            description: t("clearSelection")
          }
        ]
      },
      {
        title: t("groups.editing"),
        shortcuts: [
          {
            keys: ["Enter"],
            description: t("startEditingCell")
          },
          {
            keys: ["F2"],
            description: t("startEditingCell")
          },
          {
            keys: ["Double Click"],
            description: t("startEditingCell")
          },
          ...(enableRowAdd
            ? [
                {
                  keys: ["Shift", "Enter"],
                  description: t("insertRowBelow")
                }
              ]
            : []),
          {
            keys: [modKey, "C"],
            description: t("copySelectedCells")
          },
          {
            keys: [modKey, "X"],
            description: t("cutSelectedCells")
          },
          ...(enablePaste
            ? [
                {
                  keys: [modKey, "V"],
                  description: t("pasteCells")
                }
              ]
            : []),
          {
            keys: ["Delete"],
            description: t("clearSelectedCells")
          },
          {
            keys: ["Backspace"],
            description: t("clearSelectedCells")
          },
          ...(enableRowsDelete
            ? [
                {
                  keys: [modKey, "Backspace"],
                  description: t("deleteSelectedRows")
                },
                {
                  keys: [modKey, "Delete"],
                  description: t("deleteSelectedRows")
                }
              ]
            : []),
          ...(enableUndoRedo
            ? [
                {
                  keys: [modKey, "Z"],
                  description: t("undo")
                },
                {
                  keys: [modKey, "Shift", "Z"],
                  description: t("redo")
                }
              ]
            : [])
        ]
      },
      ...(enableSearch
        ? [
            {
              title: t("groups.search"),
              shortcuts: [
                {
                  keys: [modKey, "F"],
                  description: t("openSearch")
                },
                {
                  keys: ["Enter"],
                  description: t("nextMatch")
                },
                {
                  keys: ["Shift", "Enter"],
                  description: t("previousMatch")
                },
                {
                  keys: ["Esc"],
                  description: t("closeSearch")
                }
              ]
            }
          ]
        : []),
      {
        title: t("groups.filtering"),
        shortcuts: [
          {
            keys: [modKey, "Shift", "F"],
            description: t("toggleFilterMenu")
          },
          {
            keys: ["Backspace"],
            description: t("removeFilterWhenFocused")
          },
          {
            keys: ["Delete"],
            description: t("removeFilterWhenFocused")
          }
        ]
      },
      {
        title: t("groups.sorting"),
        shortcuts: [
          {
            keys: [modKey, "Shift", "S"],
            description: t("toggleSortMenu")
          },
          {
            keys: ["Backspace"],
            description: t("removeSortWhenFocused")
          },
          {
            keys: ["Delete"],
            description: t("removeSortWhenFocused")
          }
        ]
      },
      {
        title: t("groups.general"),
        shortcuts: [
          {
            keys: [modKey, "/"],
            description: t("showKeyboardShortcuts")
          }
        ]
      }
    ],
    [
      t,
      modKey,
      enableSearch,
      enableUndoRedo,
      enablePaste,
      enableRowAdd,
      enableRowsDelete
    ]
  )

  const filteredGroups = React.useMemo(() => {
    if (!input.trim()) return shortcutGroups

    const query = input.toLowerCase()
    return shortcutGroups
      .map(group => ({
        ...group,
        shortcuts: group.shortcuts.filter(
          shortcut =>
            shortcut.description.toLowerCase().includes(query) ||
            shortcut.keys.some(key => key.toLowerCase().includes(query))
        )
      }))
      .filter(group => group.shortcuts.length > 0)
  }, [shortcutGroups, input])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === SHORTCUT_KEY) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className="max-w-2xl px-0"
        onOpenAutoFocus={onOpenAutoFocus}
        showCloseButton={false}
      >
        <DialogClose className="absolute end-6 top-6" asChild>
          <Button variant="ghost" size="icon" className="size-6">
            <XIcon />
          </Button>
        </DialogClose>
        <DialogHeader className="px-6">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6">
          <div className="relative">
            <SearchIcon
              className="text-muted-foreground absolute start-3 top-1/2 size-3.5
                -translate-y-1/2"
            />
            <Input
              ref={inputRef}
              placeholder={t("searchPlaceholder")}
              className="h-8 ps-8"
              value={input}
              onChange={onInputChange}
            />
          </div>
        </div>
        <Separator
          className="mx-auto
            data-[orientation=horizontal]:w-[calc(100%-(--spacing(12)))]"
        />
        <div className="h-[40vh] overflow-y-auto px-6">
          {filteredGroups.length === 0 ? (
            <div
              className="flex h-full flex-col items-center justify-center gap-3
                text-center"
            >
              <div
                className="bg-muted text-foreground flex size-10 shrink-0
                  items-center justify-center rounded-lg"
              >
                <SearchIcon className="pointer-events-none size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-medium tracking-tight">
                  {t("noResultsTitle")}
                </div>
                <p className="text-muted-foreground text-sm">
                  {t("noResultsDescription")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredGroups.map(shortcutGroup => (
                <div key={shortcutGroup.title} className="flex flex-col gap-2">
                  <h3 className="text-foreground text-sm font-semibold">
                    {shortcutGroup.title}
                  </h3>
                  <div className="divide-border divide-y rounded-md border">
                    {shortcutGroup.shortcuts.map((shortcut, index) => (
                      <ShortcutCard
                        key={index}
                        keys={shortcut.keys}
                        description={shortcut.description}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutCard({
  keys,
  description
}: ShortcutGroup["shortcuts"][number]) {
  return (
    <div className="flex items-center gap-4 px-3 py-2">
      <span className="flex-1 text-sm">{description}</span>
      <KbdGroup className="shrink-0">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && (
              <span className="text-muted-foreground text-xs">+</span>
            )}
            <Kbd>{key}</Kbd>
          </React.Fragment>
        ))}
      </KbdGroup>
    </div>
  )
}
