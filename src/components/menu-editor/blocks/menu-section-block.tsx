"use client"

import { useEffect, useRef } from "react"
import { useEditor, useNode, type Node, type Nodes } from "@craftjs/core"

import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import { normalizeMenuLabelCasing } from "@/lib/menu-text"

type Category = Awaited<ReturnType<typeof getCategoriesWithItems>>[number]
export type MenuSectionData = NonNullable<Category["menuSection"]>

export type MenuSectionBlockProps = {
  data: MenuSectionData
  categoryOrder: string[]
  reconcileOnMount?: boolean
  children?: React.ReactNode
}

function getCategoryId(node: Node | undefined) {
  if (node?.data.name !== "CategoryBlock") return undefined
  return (node.data.props.data as { id?: string } | undefined)?.id
}

function getMenuSectionId(node: Node | undefined) {
  if (node?.data.name !== "MenuSectionBlock") return undefined
  return (node.data.props.data as { id?: string } | undefined)?.id
}

function findCategoryNode(
  nodes: Nodes,
  categoryId: string,
  excludedParentId: string
) {
  return Object.values(nodes).find(
    node =>
      node.data.parent !== excludedParentId &&
      getCategoryId(node) === categoryId
  )
}

export default function MenuSectionBlock({
  data,
  categoryOrder,
  reconcileOnMount = false,
  children
}: MenuSectionBlockProps) {
  const hasReconciledRef = useRef(false)
  const {
    id,
    connectors: { connect },
    actions: { setCustom }
  } = useNode()
  const { actions, isEnabled, nodes } = useEditor(state => ({
    isEnabled: state.options.enabled,
    nodes: state.nodes
  }))

  useEffect(() => {
    if (!data.name) return

    setCustom((custom: { displayName?: string }) => {
      custom.displayName = normalizeMenuLabelCasing(data.name)
    })
  }, [data.name, setCustom])

  useEffect(() => {
    if (!isEnabled || !reconcileOnMount || hasReconciledRef.current) return
    hasReconciledRef.current = true

    const currentSection = nodes[id]
    if (!currentSection) return

    const existingSection = Object.values(nodes).find(
      node => node.id !== id && getMenuSectionId(node) === data.id
    )
    const targetSectionId = existingSection?.id ?? id
    const targetCategoryIds = new Set(
      (existingSection?.data.nodes ?? [])
        .map(nodeId => getCategoryId(nodes[nodeId]))
        .filter((categoryId): categoryId is string => Boolean(categoryId))
    )
    const createdCategoryNodes = new Map(
      currentSection.data.nodes.flatMap(nodeId => {
        const categoryId = getCategoryId(nodes[nodeId])
        return categoryId ? [[categoryId, nodeId] as const] : []
      })
    )
    const mergedActions = actions.history.merge()

    if (existingSection) {
      let insertionIndex = existingSection.data.nodes.length

      for (const categoryId of categoryOrder) {
        const createdNodeId = createdCategoryNodes.get(categoryId)
        if (targetCategoryIds.has(categoryId)) {
          if (createdNodeId) mergedActions.delete(createdNodeId)
          continue
        }

        const existingCategory = findCategoryNode(nodes, categoryId, id)
        const categoryNodeId = existingCategory?.id ?? createdNodeId
        if (!categoryNodeId) continue

        if (createdNodeId && existingCategory)
          mergedActions.delete(createdNodeId)
        mergedActions.move(categoryNodeId, targetSectionId, insertionIndex)
        insertionIndex += 1
        targetCategoryIds.add(categoryId)
      }

      mergedActions.setProp(targetSectionId, props => {
        props.data = data
        props.categoryOrder = categoryOrder
      })
      mergedActions.delete(id)
      return
    }

    categoryOrder.forEach((categoryId, index) => {
      const createdNodeId = createdCategoryNodes.get(categoryId)
      const existingCategory = findCategoryNode(nodes, categoryId, id)

      if (existingCategory) {
        if (createdNodeId) mergedActions.delete(createdNodeId)
        mergedActions.move(existingCategory.id, id, index)
      }
    })

    mergedActions.setProp(id, props => {
      props.reconcileOnMount = false
    })
  }, [actions, categoryOrder, data, id, isEnabled, nodes, reconcileOnMount])

  return (
    <div
      ref={ref => {
        if (ref) connect(ref)
      }}
      data-menu-section-id={data.id}
    >
      {children}
    </div>
  )
}

MenuSectionBlock.craft = {
  displayName: "menuSection",
  props: {
    categoryOrder: [],
    reconcileOnMount: false
  },
  custom: {
    iconKey: "menuSection"
  },
  rules: {
    canMoveIn: (incomingNodes: Node[], self: Node) => {
      const sectionId = getMenuSectionId(self)
      return incomingNodes.every(node => {
        if (node.data.name !== "CategoryBlock") return false
        const category = node.data.props.data as Category | undefined
        return category?.menuSection?.id === sectionId
      })
    },
    canMoveOut: () => false
  }
}
