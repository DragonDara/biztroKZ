"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useEditor, useNode } from "@craftjs/core"
import { ImageIcon, Menu } from "lucide-react"
import { useMotionValueEvent, useScroll, useTransform } from "motion/react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { useTranslation } from "@/components/menu-editor/translation-provider"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { normalizeMenuLabelCasing } from "@/lib/menu-text"
import { cn } from "@/lib/utils"

type CategoryNodeData = {
  id: string
  name: string
  menuSection?: {
    id: string
    name: string
  } | null
  menuItems?: Array<{
    image?: string | null
  }>
}

type NavigationEntry = {
  id: string
  label: string
  menuSectionId: string | null
  image: string | null
}

type MenuSectionEntry = {
  id: string
  name: string
  firstNodeId: string
  image: string | null
  categories: NavigationEntry[]
}

export default function NavigatorBlock() {
  const t = useTranslations("menuEditor.blocks")
  const {
    connectors: { connect }
  } = useNode()
  const { nodes } = useEditor(state => ({ nodes: state.nodes }))
  const translation = useTranslation()
  const isMobile = useIsMobile()

  const navigation = useMemo(() => {
    const rootNodeIds = nodes.ROOT?.data?.nodes ?? []
    const entries: NavigationEntry[] = []
    const sections = new Map<string, MenuSectionEntry>()

    for (const nodeId of rootNodeIds) {
      const node = nodes[nodeId]
      if (!node) continue

      if (node.data.name === "HeadingElement") {
        entries.push({
          id: node.id,
          label: node.data.props.text,
          menuSectionId: null,
          image: null
        })
        continue
      }

      if (node.data.name !== "CategoryBlock") continue
      const data = node.data.props.data as CategoryNodeData | undefined
      if (!data?.id || !data.name) continue

      const entry: NavigationEntry = {
        id: node.id,
        label: normalizeMenuLabelCasing(
          translation?.getCategoryTranslation(data.id)?.name ?? data.name
        ),
        menuSectionId: data.menuSection?.id ?? null,
        image: data.menuItems?.find(item => item.image)?.image ?? null
      }
      entries.push(entry)

      if (!data.menuSection) continue
      const existingSection = sections.get(data.menuSection.id)
      if (existingSection) {
        existingSection.categories.push(entry)
        existingSection.image ??= entry.image
        continue
      }

      sections.set(data.menuSection.id, {
        id: data.menuSection.id,
        name: normalizeMenuLabelCasing(data.menuSection.name),
        firstNodeId: node.id,
        image: entry.image,
        categories: [entry]
      })
    }

    return {
      entries,
      sections: Array.from(sections.values()),
      unsectionedEntries: entries.filter(entry => !entry.menuSectionId)
    }
  }, [nodes, translation])

  const [selectedMenuSectionId, setSelectedMenuSectionId] = useState<
    string | null
  >(null)
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const categoryListRef = useRef<HTMLUListElement | null>(null)
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const [hasContainerScrollRoot, setHasContainerScrollRoot] = useState(false)

  const effectiveMenuSectionId = navigation.sections.some(
    section => section.id === selectedMenuSectionId
  )
    ? selectedMenuSectionId
    : (navigation.sections[0]?.id ?? null)
  const selectedMenuSection = navigation.sections.find(
    section => section.id === effectiveMenuSectionId
  )
  const visibleEntries = navigation.sections.length
    ? [
        ...(selectedMenuSection?.categories ?? []),
        ...navigation.unsectionedEntries
      ]
    : navigation.entries
  const { scrollY: viewportScrollY } = useScroll()
  const { scrollY: containerScrollY } = useScroll(
    hasContainerScrollRoot ? { container: scrollContainerRef } : {}
  )
  const activeScrollY = useTransform(() =>
    hasContainerScrollRoot ? containerScrollY.get() : viewportScrollY.get()
  )

  useMotionValueEvent(activeScrollY, "change", latest => {
    setIsSticky(latest > 8)
  })

  const handleNavigation = (id: string, shouldCloseDrawer = false) => {
    const targetEntry = navigation.entries.find(entry => entry.id === id)
    if (targetEntry?.menuSectionId) {
      setSelectedMenuSectionId(targetEntry.menuSectionId)
    }
    setActiveEntryId(id)

    if (shouldCloseDrawer) setIsDrawerOpen(false)

    const ownerDocument = navRef.current?.ownerDocument ?? document
    const ownerWindow = ownerDocument.defaultView ?? window
    ownerWindow.requestAnimationFrame(() => {
      const target = ownerDocument.getElementById(id)
      if (!target) return

      const navHeight = navRef.current?.offsetHeight ?? 0
      const headerOffset = getHeaderOffset(ownerDocument)
      const targetRect = target.getBoundingClientRect()
      const scrollRoot = scrollContainerRef.current

      if (scrollRoot) {
        const containerRect = scrollRoot.getBoundingClientRect()
        const absoluteTop =
          scrollRoot.scrollTop + targetRect.top - containerRect.top
        scrollRoot.scrollTo({
          top: Math.max(0, absoluteTop - navHeight - headerOffset - 8),
          behavior: "smooth"
        })
      } else {
        const absoluteTop = ownerWindow.scrollY + targetRect.top
        ownerWindow.scrollTo({
          top: Math.max(0, absoluteTop - navHeight - headerOffset - 8),
          behavior: "smooth"
        })
      }

      ownerWindow.history.replaceState(null, "", `#${id}`)
    })
  }

  useEffect(() => {
    const navNode = navRef.current
    if (!navNode) return

    const scrollRoot = getScrollRoot(navNode)
    scrollContainerRef.current = isElementScrollRoot(scrollRoot)
      ? scrollRoot
      : null
    setHasContainerScrollRoot(scrollContainerRef.current !== null)
    setIsSticky(getScrollTop(scrollRoot, navNode.ownerDocument) > 8)
  }, [])

  useEffect(() => {
    const ownerDocument = navRef.current?.ownerDocument
    if (!ownerDocument || !navigation.entries.length) return

    observer.current?.disconnect()
    const IntersectionObserverConstructor =
      ownerDocument.defaultView?.IntersectionObserver ?? IntersectionObserver
    observer.current = new IntersectionObserverConstructor(
      entries => {
        const visibleEntry = entries
          .filter(entry => entry.isIntersecting)
          .sort(
            (first, second) =>
              Math.abs(first.boundingClientRect.top) -
              Math.abs(second.boundingClientRect.top)
          )[0]
        if (!visibleEntry) return

        const entry = navigation.entries.find(
          candidate => candidate.id === visibleEntry.target.id
        )
        if (!entry) return
        setActiveEntryId(entry.id)
        if (entry.menuSectionId) {
          setSelectedMenuSectionId(entry.menuSectionId)
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "-15% 0px -60% 0px",
        threshold: [0, 0.25, 0.75]
      }
    )

    for (const entry of navigation.entries) {
      const element = ownerDocument.getElementById(entry.id)
      if (element) observer.current.observe(element)
    }

    return () => observer.current?.disconnect()
  }, [hasContainerScrollRoot, navigation.entries])

  useEffect(() => {
    const list = categoryListRef.current
    if (!list) return

    const checkOverflow = () => {
      setIsOverflowing(list.scrollWidth > list.clientWidth)
    }
    const handleScroll = () => {
      const isAtEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1
      setIsOverflowing(!isAtEnd && list.scrollWidth > list.clientWidth)
    }

    checkOverflow()
    const ResizeObserverConstructor =
      list.ownerDocument.defaultView?.ResizeObserver ?? ResizeObserver
    const resizeObserver = new ResizeObserverConstructor(checkOverflow)
    resizeObserver.observe(list)
    list.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      resizeObserver.disconnect()
      list.removeEventListener("scroll", handleScroll)
    }
  }, [effectiveMenuSectionId, visibleEntries.length])

  useEffect(() => {
    const list = categoryListRef.current
    if (!activeEntryId || !list) return
    const activeButton = Array.from(
      list.querySelectorAll<HTMLElement>("[data-navigation-id]")
    ).find(button => button.dataset.navigationId === activeEntryId)
    if (!activeButton) return

    const targetScrollLeft =
      activeButton.offsetLeft -
      (list.offsetWidth - activeButton.offsetWidth) / 2
    list.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth"
    })
  }, [activeEntryId, effectiveMenuSectionId])

  return (
    <div
      ref={ref => {
        if (ref) connect(ref)
      }}
      className="w-full"
    >
      {navigation.sections.length ? (
        <div className="px-3 pt-3 pb-5">
          <div
            role="group"
            aria-label={t("displayNames.navigation")}
            className="no-scrollbar mask-fade flex gap-3 overflow-x-auto px-0.5
              py-0.5"
          >
            {navigation.sections.map((menuSection, index) => {
              const isActive = menuSection.id === effectiveMenuSectionId
              return (
                <button
                  key={menuSection.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleNavigation(menuSection.firstNodeId)}
                  className="focus-visible:ring-ring w-36 shrink-0
                    cursor-pointer overflow-hidden rounded-2xl bg-black/55
                    text-left ring-1 ring-white/10
                    transition-[box-shadow,opacity] duration-200 outline-none
                    hover:opacity-90 focus-visible:ring-2
                    focus-visible:ring-offset-2 sm:w-40"
                  style={{
                    boxShadow: isActive
                      ? "0 0 0 2px rgba(248, 248, 248, 0.92)"
                      : undefined
                  }}
                >
                  <span className="relative block aspect-4/3 overflow-hidden">
                    {menuSection.image ? (
                      <Image
                        src={menuSection.image}
                        alt=""
                        width={160}
                        height={120}
                        sizes="(max-width: 640px) 144px, 160px"
                        className="size-full object-cover"
                        loading={index < 3 ? "eager" : "lazy"}
                        unoptimized
                      />
                    ) : (
                      <span
                        className="flex size-full items-center justify-center
                          bg-black/25 text-white/55"
                        aria-hidden="true"
                      >
                        <ImageIcon className="size-6" />
                      </span>
                    )}
                  </span>
                  <span
                    className="flex min-h-16 items-center px-4 py-3 text-base
                      leading-snug font-medium text-pretty"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(248, 248, 248, 0.96)"
                        : "rgba(15, 15, 15, 0.78)",
                      color: isActive
                        ? "rgba(15, 15, 15, 0.96)"
                        : "rgba(255, 255, 255, 0.94)"
                    }}
                  >
                    {menuSection.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <nav
        ref={navRef}
        aria-label={t("displayNames.navigation")}
        className="sticky z-20 w-screen p-3 transition-colors duration-200
          sm:w-full"
        style={{
          top: "var(--menu-header-offset, 0px)",
          backgroundColor: isSticky ? "rgba(15, 15, 15, 0.86)" : "transparent"
        }}
      >
        {visibleEntries.length ? (
          <div className="relative flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-white hover:bg-white/10 hover:text-white
                md:hidden"
              onClick={() => setIsDrawerOpen(true)}
              aria-label={t("navigator.openMenuAria")}
            >
              <Menu />
            </Button>
            <div className="relative min-w-0 flex-1 overflow-hidden">
              <ul
                ref={categoryListRef}
                className={cn(
                  "no-scrollbar flex gap-2.5 overflow-x-auto py-0.5",
                  isOverflowing && "mask-fade"
                )}
              >
                {visibleEntries.map((entry, index) => {
                  const isActive = activeEntryId
                    ? activeEntryId === entry.id
                    : index === 0
                  return (
                    <li key={entry.id} className="shrink-0">
                      <button
                        type="button"
                        data-navigation-id={entry.id}
                        aria-current={isActive ? "location" : undefined}
                        onClick={() => handleNavigation(entry.id)}
                        className="focus-visible:ring-ring cursor-pointer
                          rounded-full px-5 py-2.5 text-sm leading-none
                          font-medium whitespace-nowrap ring-1
                          transition-[background-color,color,opacity]
                          duration-200 outline-none hover:opacity-90
                          focus-visible:ring-2 focus-visible:ring-offset-2
                          sm:text-base"
                        style={{
                          backgroundColor: "rgba(15, 15, 15, 0.78)",
                          color: "rgba(255, 255, 255, 0.94)",
                          boxShadow: isActive
                            ? "inset 0 0 0 1px rgba(248, 248, 248, 0.92)"
                            : "inset 0 0 0 1px rgba(255, 255, 255, 0.06)"
                        }}
                      >
                        {entry.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/70">
            {t("displayNames.navigation")}
          </p>
        )}
      </nav>

      {isMobile && navigation.entries.length ? (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-h-[85%]">
            <DrawerHeader>
              <DrawerTitle>{t("displayNames.navigation")}</DrawerTitle>
            </DrawerHeader>
            <nav
              aria-label={t("displayNames.navigation")}
              className="no-scrollbar overflow-y-auto px-4 pb-8"
            >
              <ul className="flex flex-col gap-1">
                {navigation.entries.map(entry => {
                  const menuSection = navigation.sections.find(
                    section => section.id === entry.menuSectionId
                  )
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => handleNavigation(entry.id, true)}
                        className={cn(
                          `hover:bg-accent focus-visible:ring-ring flex w-full
                            cursor-pointer flex-col items-start rounded-md px-4
                            py-3 text-left transition-colors outline-none
                            focus-visible:ring-2`,
                          activeEntryId === entry.id && "bg-accent"
                        )}
                      >
                        {menuSection ? (
                          <span className="text-muted-foreground text-xs">
                            {menuSection.name}
                          </span>
                        ) : null}
                        <span className="text-base font-medium">
                          {entry.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  )
}

NavigatorBlock.craft = {
  displayName: "navigation",
  custom: {
    iconKey: "navigator"
  }
}

function getHeaderOffset(ownerDocument: Document) {
  const rawValue = ownerDocument.defaultView
    ?.getComputedStyle(ownerDocument.documentElement)
    .getPropertyValue("--menu-header-offset")
    .trim()
  const parsedValue = Number.parseFloat(rawValue ?? "")
  return Number.isNaN(parsedValue) ? 0 : parsedValue
}

type ScrollRoot = Window | HTMLElement

function getScrollRoot(node: HTMLElement): ScrollRoot {
  let current: HTMLElement | null = node.parentElement
  const ownerWindow = node.ownerDocument.defaultView ?? window

  while (current) {
    if (current.dataset.menuScrollRoot === "true") return current

    const styles = ownerWindow.getComputedStyle(current)
    if (
      /(auto|scroll|overlay)/.test(styles.overflowY) &&
      current.scrollHeight > current.clientHeight
    ) {
      return current
    }
    current = current.parentElement
  }

  return ownerWindow
}

function getScrollTop(root: ScrollRoot, ownerDocument: Document) {
  return isElementScrollRoot(root)
    ? root.scrollTop
    : root.scrollY || ownerDocument.documentElement.scrollTop || 0
}

function isElementScrollRoot(root: ScrollRoot): root is HTMLElement {
  return "scrollTop" in root
}
