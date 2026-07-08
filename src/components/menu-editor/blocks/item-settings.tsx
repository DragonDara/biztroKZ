"use client"

import { useEditor, useNode } from "@craftjs/core"
import { CaseSensitive, CaseUpper, Paintbrush } from "lucide-react"
import { useTranslations } from "next-intl"

import { type ItemBlockProps } from "@/components/menu-editor/blocks/item-block"
import SideSection from "@/components/menu-editor/side-section"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { FONT_SIZES } from "@/lib/types/theme"

export default function ItemSettings() {
  const t = useTranslations("menuEditor.blocks")
  const {
    id,
    actions: { setProp },
    backgroundMode,
    itemFontSize,
    itemFontWeight,
    itemTextTransform,
    priceFontSize,
    priceFontWeight,
    showImage
  } = useNode(node => ({
    backgroundMode: node.data.props.backgroundMode,
    categoryFontSize: node.data.props.categoryFontSize,
    categoryColor: node.data.props.categoryColor,
    categoryFontWeight: node.data.props.categoryFontWeight,
    categoryTextAlign: node.data.props.categoryTextAlign,
    itemFontSize: node.data.props.itemFontSize,
    itemColor: node.data.props.itemColor,
    itemFontWeight: node.data.props.itemFontWeight,
    itemTextTransform: node.data.props.itemTextTransform,
    priceFontSize: node.data.props.priceFontSize,
    priceColor: node.data.props.priceColor,
    priceFontWeight: node.data.props.priceFontWeight,
    showImage: node.data.props.showImage
  }))

  const { actions: editorActions, nodes } = useEditor(state => ({
    nodes: state.nodes
  }))

  const applyToAll = () => {
    const styleProps = {
      backgroundMode,
      itemFontSize,
      itemFontWeight,
      itemTextTransform: itemTextTransform ?? "none",
      priceFontSize,
      priceFontWeight,
      showImage
    }
    for (const [key, value] of Object.entries(nodes)) {
      if (key === id) continue
      if (value.data?.name === "ItemBlock") {
        editorActions.history.ignore().setProp(key, props => {
          Object.assign(props, styleProps)
        })
      }
    }
  }

  return (
    <>
      <SideSection title={t("common.general")}>
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="xs">{t("common.background")}</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={backgroundMode}
              onValueChange={value =>
                setProp(
                  (props: ItemBlockProps) =>
                    (props.backgroundMode = value as "none" | "custom")
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("common.backgroundNone")}
                </SelectItem>
                <SelectItem value="custom">
                  {t("common.backgroundCustom")}
                </SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
      <SideSection title={t("common.product")}>
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="xs">{t("common.size")}</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={itemFontSize.toString()}
              onValueChange={value =>
                setProp(
                  (props: ItemBlockProps) =>
                    (props.itemFontSize = parseInt(value))
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">{t("common.style")}</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={itemFontWeight}
              onValueChange={value =>
                setProp(
                  (props: ItemBlockProps) => (props.itemFontWeight = value)
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">
                  {t("common.fontWeightLight")}
                </SelectItem>
                <SelectItem value="400">
                  {t("common.fontWeightRegular")}
                </SelectItem>
                <SelectItem value="500">
                  {t("common.fontWeightMedium")}
                </SelectItem>
                <SelectItem value="700">
                  {t("common.fontWeightBold")}
                </SelectItem>
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">{t("common.capitalize")}</Label>
          </dt>
          <dd className="col-span-2">
            <Tabs
              value={itemTextTransform ?? "none"}
              onValueChange={value =>
                setProp(
                  (props: ItemBlockProps) =>
                    (props.itemTextTransform =
                      value as ItemBlockProps["itemTextTransform"])
                )
              }
            >
              <TabsList className="h-8 p-0.5">
                <TabsTrigger
                  value="none"
                  aria-label={t("common.capitalizeNormalAria")}
                >
                  <CaseSensitive className="size-3.5" />
                </TabsTrigger>
                <TabsTrigger
                  value="uppercase"
                  aria-label={t("common.capitalizeUpperAria")}
                >
                  <CaseUpper className="size-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </dd>
        </div>
      </SideSection>
      <SideSection title={t("common.price")}>
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="xs">{t("common.size")}</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={priceFontSize.toString()}
              onValueChange={value =>
                setProp(
                  (props: ItemBlockProps) =>
                    (props.priceFontSize = parseInt(value))
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">{t("common.style")}</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={priceFontWeight}
              onValueChange={value =>
                setProp(
                  (props: ItemBlockProps) => (props.priceFontWeight = value)
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">
                  {t("common.fontWeightLight")}
                </SelectItem>
                <SelectItem value="400">
                  {t("common.fontWeightRegular")}
                </SelectItem>
                <SelectItem value="500">
                  {t("common.fontWeightMedium")}
                </SelectItem>
                <SelectItem value="700">
                  {t("common.fontWeightBold")}
                </SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
      <SideSection title={t("common.productImage")}>
        <div className="grid grid-cols-3 items-center gap-y-2">
          <dt>
            <Label size="xs">{t("common.show")}</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Switch
              className="sm:scale-75"
              checked={showImage}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<ItemBlockProps>) =>
                    (props.showImage = checked)
                )
              }}
            />
          </dd>
        </div>
      </SideSection>
      <div className="px-4 py-3">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={applyToAll}
            >
              <Paintbrush className="size-3.5" />
              {t("common.applyToAll")}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t("propagate.products")}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
