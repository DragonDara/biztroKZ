import { Images } from "lucide-react"
import { getTranslations } from "next-intl/server"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { getAllMediaAssets } from "@/server/actions/media/queries"
import { MediaCard } from "./media-card"

export async function MediaGrid() {
  const [assets, t] = await Promise.all([
    getAllMediaAssets(),
    getTranslations("dashboard.settings.media")
  ])

  if (assets.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Images className="size-5" />
          </EmptyMedia>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4
        lg:grid-cols-5"
    >
      {assets.map(asset => (
        <MediaCard key={asset.id} asset={asset} />
      ))}
    </div>
  )
}
