"use client"

import { LayoutList, Settings2, SquarePlus, SwatchBook } from "lucide-react"
import { useTranslations } from "next-intl"

import { PanelType } from "@/components/menu-editor/workbench"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BottomBarProps {
  setActivePanel: (panel: PanelType) => void
  setIsOpen: (open: boolean) => void
  isOpen: boolean
  getPanelContent: () => React.ReactNode
}

export function BottomBar({
  setActivePanel,
  setIsOpen,
  isOpen,
  getPanelContent
}: BottomBarProps) {
  const t = useTranslations("menuEditor.mobileNav")

  return (
    <>
      <div
        className="editor-bottombar fixed bottom-0 z-10 flex w-full flex-row
          items-center justify-between border-t bg-gray-50 px-8 pt-1 pb-3
          dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full [&_svg]:size-6"
            onClick={() => {
              setActivePanel(PanelType.TOOLBOX)
              setIsOpen(true)
            }}
          >
            <SquarePlus className="size-6" />
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {t("elements")}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full [&_svg]:size-6"
            onClick={() => {
              setActivePanel(PanelType.THEME)
              setIsOpen(true)
            }}
          >
            <SwatchBook className="size-6" />
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {t("themes")}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full [&_svg]:size-6"
            onClick={() => {
              setActivePanel(PanelType.LAYERS)
              setIsOpen(true)
            }}
          >
            <LayoutList className="size-6" />
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {t("sections")}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full [&_svg]:size-6"
            onClick={() => {
              setActivePanel(PanelType.SETTINGS)
              setIsOpen(true)
            }}
          >
            <Settings2 className="size-6" />
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {t("settings")}
          </span>
        </div>
      </div>
      <Drawer open={isOpen} onOpenChange={setIsOpen} handleOnly>
        <DrawerContent>
          <ScrollArea className="h-[80vh]">{getPanelContent()}</ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  )
}
