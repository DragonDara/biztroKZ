"use client"

import type { ComponentProps } from "react"
import dynamic from "next/dynamic"

import type Workbench from "@/components/menu-editor/workbench"
import Spinner from "@/components/ui/spinner"

const WorkbenchClient = dynamic(
  () => import("@/components/menu-editor/workbench"),
  {
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner />
      </div>
    ),
    ssr: false
  }
)

export default function WorkbenchLoader(
  props: ComponentProps<typeof Workbench>
) {
  return <WorkbenchClient {...props} />
}
