"use client"

import { Edit, ImageIcon, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle
} from "@/components/ui/item"
import type { getMenuSections } from "@/server/actions/item/queries"
import MenuSectionDelete from "@/app/dashboard/menu-items/categories/menu-section-delete"
import MenuSectionEdit from "@/app/dashboard/menu-items/categories/menu-section-edit"
import { ActionType } from "@/lib/types/category"

export default function MenuSectionList({
  menuSections
}: {
  menuSections: Awaited<ReturnType<typeof getMenuSections>>
}) {
  const t = useTranslations("dashboard.menuItems.categories")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("menuSectionsTitle")}</CardTitle>
        <CardDescription>{t("menuSectionsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {menuSections.length ? (
          <ItemGroup className="gap-2">
            {menuSections.map(menuSection => (
              <Item key={menuSection.id} variant="outline" size="sm">
                <div
                  className="bg-muted relative aspect-4/3 w-14 shrink-0
                    overflow-hidden rounded-md"
                >
                  {menuSection.coverImage ? (
                    <Image
                      src={menuSection.coverImage}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="text-muted-foreground flex size-full
                        items-center justify-center"
                      aria-hidden="true"
                    >
                      <ImageIcon className="size-4" />
                    </div>
                  )}
                </div>
                <ItemContent>
                  <ItemTitle>
                    <span className="truncate">{menuSection.name}</span>
                    <Badge variant="secondary">
                      {t("categoryCount", {
                        count: menuSection._count.categories
                      })}
                    </Badge>
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  <MenuSectionEdit
                    action={ActionType.UPDATE}
                    menuSection={menuSection}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("menuSectionDialogEdit")}
                    >
                      <Edit />
                    </Button>
                  </MenuSectionEdit>
                  <MenuSectionDelete menuSection={menuSection}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("menuSectionDeleteTitle")}
                    >
                      <Trash2 />
                    </Button>
                  </MenuSectionDelete>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("menuSectionsEmpty")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
