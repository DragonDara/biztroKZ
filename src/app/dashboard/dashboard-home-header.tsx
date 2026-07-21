"use client"

import { ChevronRightIcon, GlobeIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { getPublishedMenuUrl } from "@/lib/utils"

export function DashboardHomeHeader({ orgSlug }: { orgSlug?: string | null }) {
  const t = useTranslations("dashboard.menus")

  return (
    <PageSubtitle>
      <PageSubtitle.Title>{t("title")}</PageSubtitle.Title>
      <PageSubtitle.Description>{t("description")}</PageSubtitle.Description>
      <PageSubtitle.Info>{t("info")}</PageSubtitle.Info>
      <PageSubtitle.Actions>
        {orgSlug && (
          <Item
            size="sm"
            variant="outline"
            className="bg-white/70 dark:bg-black/30"
            asChild
          >
            <Link
              href={getPublishedMenuUrl(orgSlug)}
              className="block w-full"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
            >
              <ItemMedia>
                <GlobeIcon className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{t("visitOnline")}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        )}
      </PageSubtitle.Actions>
    </PageSubtitle>
  )
}
