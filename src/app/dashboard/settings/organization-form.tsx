"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"
import { type z } from "zod/v4"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { FileUploader } from "@/components/dashboard/file-uploader"
import { ImageField } from "@/components/dashboard/image-field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { updateOrg } from "@/server/actions/organization/mutations"
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import { ImageType } from "@/lib/types/media"
import { orgSchema } from "@/lib/types/organization"
import { type OrganizationStatus, type Plan } from "@/lib/types/plan"
import { getInitials } from "@/lib/utils"

export default function OrganizationForm({
  data,
  enabled
}: {
  data: NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>
  enabled: boolean
}) {
  const t = useTranslations("dashboard.settings.organization")
  const tCommon = useTranslations("dashboard.common")

  const form = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      id: data.id,
      name: data.name,
      description: data.description ?? undefined,
      slug: data.slug,
      status: data.status as OrganizationStatus,
      plan: data.plan?.toUpperCase() as Plan
    }
  })

  const router = useRouter()
  const queryClient = useQueryClient()
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false)

  const { execute, status, reset } = useAction(updateOrg, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(t("updated"))
        queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })
      } else if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      }

      reset()
    },
    onError: () => {
      toast.error(t("updateError"))
    }
  })

  const onSubmit = (values: z.infer<typeof orgSchema>) => {
    execute(values)
  }

  const handleLogoUploadSuccess = () => {
    setUploadDialogOpen(false)
    queryClient.invalidateQueries({
      queryKey: ["workgroup", "current"]
    })
    router.refresh()
  }

  // Refresh form when data changes
  useEffect(() => {
    form.reset({
      id: data.id,
      name: data.name,
      description: data.description ?? undefined,
      slug: data.slug,
      status: data.status as OrganizationStatus,
      plan: data.plan?.toUpperCase() as Plan
    })
  }, [data, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet disabled={!enabled} className="mt-10">
        <FieldGroup>
          <div className="flex items-center gap-x-8">
            <Avatar
              className="h-24 w-24 rounded-xl ring-1 ring-black/10 ring-inset
                dark:ring-white/15"
            >
              {data.logo && (
                <AvatarImage src={data.logo} className="rounded-xl" />
              )}
              <AvatarFallback className="text-3xl">
                {getInitials(data.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    {t("changeImage")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{t("uploadImage")}</DialogTitle>
                  </DialogHeader>
                  <FileUploader
                    organizationId={data.id}
                    imageType={ImageType.LOGO}
                    objectId={ImageType.LOGO}
                    limitDimension={500}
                    onUploadSuccess={handleLogoUploadSuccess}
                  />
                </DialogContent>
              </Dialog>
              <p className="text-muted-foreground mt-2 text-xs">
                {t("logoHint")}
              </p>
            </div>
          </div>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("businessName")}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={t("businessNamePlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("descriptionLabel")}
                </FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={t("descriptionPlaceholder")}
                />
                <FieldDescription>{t("descriptionHint")}</FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("website")}</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("websitePlaceholder")}
                    className="pl-1!"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>
                      .{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>{t("websiteHint")}</FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="space-y-2">
            <FieldLabel>{t("coverImage")}</FieldLabel>
            {data.banner ? (
              <ImageField
                src={data.banner}
                organizationId={data.id}
                imageType={ImageType.BANNER}
                objectId={ImageType.BANNER}
                onUploadSuccess={() => {
                  router.refresh()
                }}
              />
            ) : (
              <EmptyImageField
                organizationId={data.id}
                imageType={ImageType.BANNER}
                objectId={ImageType.BANNER}
                onUploadSuccess={() => {
                  router.refresh()
                }}
              />
            )}
            <FieldDescription>{t("coverImageHint")}</FieldDescription>
          </div>
          <Field orientation="responsive">
            <Button disabled={status === "executing"} type="submit">
              {status === "executing" && (
                <Loader className="mr-2 animate-spin" />
              )}
              <TextMorph>
                {status === "executing" ? t("saving") : tCommon("save")}
              </TextMorph>
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
