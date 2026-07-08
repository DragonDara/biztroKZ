"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import ContentEditable from "react-contenteditable"
import { useEditor } from "@craftjs/core"
import { useLayer } from "@craftjs/layers"

import { useResolveBlockDisplayName } from "@/components/menu-editor/resolve-block-display-name"

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
  const nameDOM = useRef<HTMLElement | null>(null)

  const clickOutside = useCallback((e: MouseEvent) => {
    if (nameDOM.current && !nameDOM.current.contains(e.target as Node)) {
      setEditingName(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      window.removeEventListener("click", clickOutside)
    }
  }, [clickOutside])

  const contentEditableRef = useRef<ContentEditable | null>(null)

  useEffect(() => {
    const ref = contentEditableRef.current
    if (ref) {
      nameDOM.current = ref.el.current
      window.removeEventListener("click", clickOutside)
      window.addEventListener("click", clickOutside)
    }
  }, [clickOutside])

  if (!editingName) {
    return (
      <h2 className="line-clamp-1" onDoubleClick={() => setEditingName(true)}>
        {resolveBlockDisplayName(displayName)}
      </h2>
    )
  }

  return (
    <ContentEditable
      html={displayName ?? ""}
      disabled={false}
      ref={contentEditableRef}
      onChange={e => {
        actions.setCustom(id, custom => (custom.displayName = e.target.value))
      }}
      tagName="h2"
      className="line-clamp-1"
      onDoubleClick={() => setEditingName(true)}
    />
  )
}
