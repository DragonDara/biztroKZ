import type { Nodes } from "@craftjs/core"

export function getOrderedMenuNodeIds(nodes: Nodes): string[] {
  const orderedNodeIds: string[] = []
  const rootNodeIds = nodes.ROOT?.data.nodes ?? []

  for (const nodeId of rootNodeIds) {
    orderedNodeIds.push(nodeId)

    const node = nodes[nodeId]
    if (node?.data.name === "MenuSectionBlock") {
      orderedNodeIds.push(...node.data.nodes)
    }
  }

  return orderedNodeIds
}
