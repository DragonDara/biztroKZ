"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import ContentEditable from "react-contenteditable"
import { useEditor } from "@craftjs/core"
import { useLayer } from "@craftjs/layers"

import { useResolveBlockDisplayName } from "@/components/menu-editor/resolve-block-display-name"
import { canonicalizeBlockDisplayName } from "@/lib/menu-editor/block-display-names"

export const LayerName = () => {
  const { id } = useLayer()
  const resolveBlockDisplayName = useResolveBlockDisplayName()

  const { displayName, actions } = useEditor(state => ({
    displayName: state.nodes[id]?.data.custom.displayName
      ? state.nodes[id]?.data.custom.displayName
      : state.nodes[id]?.data.displayName,
    hidden: state.nodes[id]?.data.hidden
  }))

  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState("")
  const nameDOM = useRef<HTMLElement | null>(null)
  const contentEditableRef = useRef<ContentEditable | null>(null)

  const commitEdit = useCallback(() => {
    const nextName = canonicalizeBlockDisplayName(draftName)
    actions.setCustom(id, custom => {
      custom.displayName = nextName
    })
    setEditingName(false)
  }, [actions, draftName, id])

  const clickOutside = useCallback(
    (e: MouseEvent) => {
      if (nameDOM.current && !nameDOM.current.contains(e.target as Node)) {
        commitEdit()
      }
    },
    [commitEdit]
  )

  useEffect(() => {
    if (!editingName) return

    const ref = contentEditableRef.current
    if (ref) {
      nameDOM.current = ref.el.current
    }

    // Defer so the opening double-click does not immediately close edit mode
    const timer = window.setTimeout(() => {
      window.addEventListener("click", clickOutside)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("click", clickOutside)
    }
  }, [editingName, clickOutside])

  const resolvedName = resolveBlockDisplayName(displayName)

  if (!editingName) {
    return (
      <h2
        className="line-clamp-1"
        onDoubleClick={() => {
          setDraftName(resolvedName)
          setEditingName(true)
        }}
      >
        {resolvedName}
      </h2>
    )
  }

  return (
    <ContentEditable
      html={draftName}
      disabled={false}
      ref={contentEditableRef}
      onChange={e => setDraftName(e.target.value)}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter") {
          e.preventDefault()
          commitEdit()
        }
        if (e.key === "Escape") {
          e.preventDefault()
          setEditingName(false)
        }
      }}
      tagName="h2"
      className="line-clamp-1"
    />
  )
}
