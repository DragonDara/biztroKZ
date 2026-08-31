"use client"

import { useEffect, useRef, type RefObject } from "react"
import { Element, Frame, ROOT_NODE, useEditor } from "@craftjs/core"

import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import CssStyles from "@/components/menu-editor/css-styles"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getCurrentOrganization } from "@/server/actions/user/queries"

export interface FramePreviewContentProps {
  frameDocument: Document | null | undefined
  frameDocRef: RefObject<Document | null>
  json?: string
  organization: NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>
  location: Awaited<ReturnType<typeof getDefaultLocation>> | null
  updateFrameHeight: () => void
}

export function pauseFrameMedia(doc: Document | null | undefined) {
  if (!doc) return

  try {
    ;(
      doc.querySelectorAll("video, audio") as NodeListOf<HTMLMediaElement>
    ).forEach(el => {
      try {
        el.pause()
      } catch {
        // ignore
      }
    })
    ;(doc.querySelectorAll("iframe") as NodeListOf<HTMLIFrameElement>).forEach(
      iframe => {
        try {
          const win = iframe.contentWindow
          win?.postMessage({ type: "react-activity-hidden" }, "*")
        } catch {
          // ignore
        }
      }
    )
  } catch {
    // ignore
  }
}

export function FramePreviewContent({
  frameDocument,
  frameDocRef,
  json,
  organization,
  location,
  updateFrameHeight
}: FramePreviewContentProps) {
  // Stable collector: no node subscription, we only need actions/query.
  const { actions, query } = useEditor(() => null)

  // Disable sticky header in the editor preview so it scrolls with content
  // instead of pinning to the top of the iframe's own viewport.
  useEffect(() => {
    if (!frameDocument) return
    const existing = frameDocument.getElementById("editor-canvas-overrides")
    existing?.remove()
    const style = frameDocument.createElement("style")
    style.id = "editor-canvas-overrides"
    style.textContent =
      "header, nav, [data-menu-navigation-root] { position: relative !important; top: unset !important; }"
    frameDocument.head.appendChild(style)
    return () => {
      frameDocument.getElementById("editor-canvas-overrides")?.remove()
    }
  }, [frameDocument])

  useEffect(() => {
    frameDocRef.current = frameDocument ?? null
    if (!frameDocument) return

    updateFrameHeight()
    const win = frameDocument.defaultView
    const target = frameDocument.body ?? frameDocument.documentElement
    if (!target) return

    const ResizeObserverClass = win?.ResizeObserver ?? window.ResizeObserver
    if (!ResizeObserverClass) return

    const resizeObserver = new ResizeObserverClass(() => {
      updateFrameHeight()
    })
    resizeObserver.observe(target)
    return () => {
      resizeObserver.disconnect()
      pauseFrameMedia(frameDocument)
    }
  }, [frameDocument, frameDocRef, updateFrameHeight])

  // Craft's <Frame data={...}> deserializes into the store during its own
  // render, which synchronously notifies mounted subscribers (Layers panel,
  // toolbar, etc.) and triggers React's "Cannot update a component while
  // rendering a different component" error. Load the content in an effect
  // instead, where store updates are legal, and render an empty <Frame />.
  const hasLoadedContentRef = useRef(false)
  useEffect(() => {
    if (hasLoadedContentRef.current) return
    hasLoadedContentRef.current = true

    if (json) {
      actions.history.ignore().deserialize(json)
    } else {
      const defaultContent = (
        <Element is={ContainerBlock} canvas>
          <HeaderBlock
            organization={organization}
            location={location ?? undefined}
            showBanner={Boolean(organization.banner?.trim())}
          />
        </Element>
      )
      const tree = query
        .parseReactElement(defaultContent)
        .toNodeTree((node, jsx) => {
          if (jsx === defaultContent) {
            node.id = ROOT_NODE
          }
          return node
        })
      actions.history.ignore().addNodeTree(tree)
    }

    // Load once per mount, mirroring Frame's own one-shot behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CssStyles frameDocument={frameDocument}>
      <Frame />
    </CssStyles>
  )
}
