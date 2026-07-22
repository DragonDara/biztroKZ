"use client"

import { useNode } from "@craftjs/core"
import { useTranslations } from "next-intl"

import type { HeaderBlockProps } from "@/components/menu-editor/blocks/header-block"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function HeaderSettings() {
  const t = useTranslations("menuEditor.blocks")
  const {
    actions: { setProp },
    showBanner,
    showLogo,
    showAddress,
    showSocialMedia
  } = useNode(node => ({
    accentColor: node.data.props.accentColor,
    showBanner: node.data.props.showBanner,
    showLogo: node.data.props.showLogo,
    showAddress: node.data.props.showAddress,
    showSocialMedia: node.data.props.showSocialMedia
  }))
  return (
    <>
      <SideSection title={t("common.images")}>
        <div className="grid grid-cols-2 items-center gap-y-2">
          <dt>
            <Label size="xs">{t("header.logo")}</Label>
          </dt>
          <dd className="flex items-center">
            <Switch
              className="sm:scale-75"
              checked={showLogo}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<HeaderBlockProps>) =>
                    (props.showLogo = checked)
                )
              }}
            />
          </dd>
          <dt>
            <Label size="xs">{t("header.cover")}</Label>
          </dt>
          <dd className="flex items-center">
            <Switch
              className="sm:scale-75"
              checked={showBanner}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<HeaderBlockProps>) =>
                    (props.showBanner = checked)
                )
              }}
            />
          </dd>
        </div>
      </SideSection>
      <SideSection title={t("common.business")}>
        <div className="grid grid-cols-2 items-center gap-y-2">
          <dt>
            <Label size="xs">{t("header.businessInfo")}</Label>
          </dt>
          <dd className="flex items-center">
            <Switch
              className="sm:scale-75"
              checked={showAddress}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<HeaderBlockProps>) =>
                    (props.showAddress = checked)
                )
              }}
            />
          </dd>
          <dt>
            <Label size="xs">{t("header.socialMedia")}</Label>
          </dt>
          <dd className="flex items-center">
            <Switch
              className="sm:scale-75"
              checked={showSocialMedia}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<HeaderBlockProps>) =>
                    (props.showSocialMedia = checked)
                )
              }}
            />
          </dd>
        </div>
      </SideSection>
    </>
  )
}
