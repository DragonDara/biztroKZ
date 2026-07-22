"use client"

import { useEffect, type ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { type Location } from "@/generated/prisma-client/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import Image from "next/image"
import { TextMorph } from "torph/react"
import { type z as zType } from "zod/v4"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  createLocation,
  updateLocation
} from "@/server/actions/location/mutations"
import type { Currency } from "@/lib/currency"
import { locationSchema } from "@/lib/types/location"

export default function LocationForm({
  data,
  enabled,
  onSuccess,
  submitLabel,
  secondaryAction
}: {
  data: Location | null
  enabled: boolean
  onSuccess?: (location: Location) => void
  submitLabel?: string
  secondaryAction?: ReactNode
}) {
  const t = useTranslations("dashboard.settings.location.form")

  /* const locationSchema = useMemo(
    () =>
      z.object({
        id: z.string().optional(),
        name: z
          .string({
            error: issue =>
              issue.input === undefined
                ? t("validation.nameRequired")
                : undefined
          })
          .min(3, { error: t("validation.nameTooShort") })
          .max(100),
        description: z.string().optional(),
        address: z
          .string({
            error: issue =>
              issue.input === undefined
                ? t("validation.addressRequired")
                : undefined
          })
          .min(3, { error: t("validation.addressInvalid") }),
        phone: z
          .string()
          .regex(/^\d{10}$/, { error: t("validation.phoneInvalid") })
          .optional(),
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        tiktok: z.string().optional(),
        whatsapp: z.string().optional(),
        website: z.url().optional(),
        organizationId: z.string().optional(),
        serviceDelivery: z.boolean().default(false).optional(),
        serviceTakeout: z.boolean().default(false).optional(),
        serviceDineIn: z.boolean().default(false).optional(),
        deliveryFee: z.number().min(0).default(0).optional(),
        currency: z.enum(["MXN", "USD"]).default("MXN").optional()
      }),
    [t]
  ) */

  const form = useForm<zType.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name,
      description: data?.description ?? undefined,
      address: data?.address ?? undefined,
      phone: data?.phone ?? undefined,
      facebook: data?.facebook ?? undefined,
      instagram: data?.instagram ?? undefined,
      twitter: data?.twitter ?? undefined,
      tiktok: data?.tiktok ?? undefined,
      whatsapp: data?.whatsapp ?? undefined,
      website: data?.website ?? undefined,
      serviceDelivery: data?.serviceDelivery ?? false,
      serviceTakeout: data?.serviceTakeout ?? false,
      serviceDineIn: data?.serviceDineIn ?? false,
      deliveryFee: data?.deliveryFee ?? 0,
      currency: (data?.currency as Currency) ?? "KZT",
      organizationId: data?.organizationId ?? undefined
    }
  })

  const {
    execute: executeCreate,
    status: statusCreate,
    reset: resetCreate
  } = useAction(createLocation, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(t("created"))
        // Reload the form with the latest data
        const result = data?.success
        form.reset({
          id: result.id,
          name: result.name,
          description: result.description ?? undefined,
          address: result.address ?? undefined,
          phone: result.phone ?? undefined,
          facebook: result.facebook ?? undefined,
          instagram: result.instagram ?? undefined,
          twitter: result.twitter ?? undefined,
          tiktok: result.tiktok ?? undefined,
          whatsapp: result.whatsapp ?? undefined,
          website: result.website ?? undefined,
          serviceDelivery: result.serviceDelivery ?? false,
          serviceTakeout: result.serviceTakeout ?? false,
          serviceDineIn: result.serviceDineIn ?? false,
          deliveryFee: result.deliveryFee ?? 0,
          currency: (result.currency as Currency) ?? "KZT",
          organizationId: result.organizationId ?? undefined
        })
        onSuccess?.(result)
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }

      resetCreate()
    },
    onError: () => {
      toast.error(t("updateError"))
      resetCreate()
    }
  })

  const {
    execute: executeUpdate,
    status: statusUpdate,
    reset: resetUpdate
  } = useAction(updateLocation, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(t("updated"))
        onSuccess?.(data.success)
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }
      resetUpdate()
    },
    onError: () => {
      toast.error(t("updateError"))
      resetUpdate()
    }
  })

  const onSubmit = (values: zType.infer<typeof locationSchema>) => {
    if (data) {
      executeUpdate(values)
    } else {
      executeCreate(values)
    }
  }

  // Refresh form when data changes
  useEffect(() => {
    form.reset({
      id: data?.id,
      name: data?.name,
      description: data?.description ?? undefined,
      address: data?.address ?? undefined,
      phone: data?.phone ?? undefined,
      facebook: data?.facebook ?? undefined,
      instagram: data?.instagram ?? undefined,
      twitter: data?.twitter ?? undefined,
      tiktok: data?.tiktok ?? undefined,
      whatsapp: data?.whatsapp ?? undefined,
      website: data?.website ?? undefined,
      serviceDelivery: data?.serviceDelivery ?? false,
      serviceTakeout: data?.serviceTakeout ?? false,
      serviceDineIn: data?.serviceDineIn ?? false,
      deliveryFee: data?.deliveryFee ?? 0,
      currency: (data?.currency as Currency) ?? "KZT",
      organizationId: data?.organizationId ?? undefined
    })
  }, [data, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet disabled={!enabled} className="mt-10">
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("branchName")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("branchNamePlaceholder")}
                />
                <FieldDescription>{t("branchNameHint")}</FieldDescription>
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
              <Field>
                <FieldLabel htmlFor={field.name}>{t("description")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("descriptionPlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("address")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("addressPlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("phone")}</FieldLabel>
                <Input
                  type="tel"
                  {...field}
                  id={field.name}
                  className="sm:w-1/2"
                  placeholder={t("phonePlaceholder")}
                />
                <FieldDescription>{t("phoneHint")}</FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <FieldSet disabled={!enabled} className="mt-10">
        <FieldLegend>{t("socialLegend")}</FieldLegend>
        <FieldDescription>{t("socialDescription")}</FieldDescription>
        <FieldGroup>
          <Controller
            name="facebook"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/facebook.svg"
                    alt="Facebook"
                    width={24}
                    height={24}
                    unoptimized
                  />
                  Facebook
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("usernamePlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="instagram"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/instagram.svg"
                    alt="Instagram"
                    width={24}
                    height={24}
                    unoptimized
                  />
                  Instagram
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("usernamePlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="twitter"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/twitter.svg"
                    alt="Twitter"
                    width={24}
                    height={24}
                    unoptimized
                  />
                  Twitter
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("usernamePlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="tiktok"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/tiktok.svg"
                    alt="TikTok"
                    width={24}
                    height={24}
                    unoptimized
                  />
                  TikTok
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("usernamePlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="whatsapp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/whatsapp.svg"
                    alt="WhatsApp"
                    width={24}
                    height={24}
                    unoptimized
                  />
                  WhatsApp
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("whatsappPlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <FieldSet disabled={!enabled} className="mt-10">
        <FieldLegend>{t("servicesLegend")}</FieldLegend>
        <FieldDescription>{t("servicesDescription")}</FieldDescription>
        <FieldGroup>
          <Controller
            name="serviceDineIn"
            control={form.control}
            render={({ field }) => (
              <FieldLabel htmlFor={field.name}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{t("dineIn")}</FieldTitle>
                    <FieldDescription>{t("dineInHint")}</FieldDescription>
                  </FieldContent>
                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              </FieldLabel>
            )}
          />
          <Controller
            name="serviceTakeout"
            control={form.control}
            render={({ field }) => (
              <FieldLabel htmlFor={field.name}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{t("takeout")}</FieldTitle>
                    <FieldDescription>{t("takeoutHint")}</FieldDescription>
                  </FieldContent>
                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              </FieldLabel>
            )}
          />
          <Controller
            name="serviceDelivery"
            control={form.control}
            render={({ field }) => (
              <FieldLabel htmlFor={field.name}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{t("delivery")}</FieldTitle>
                    <FieldDescription>{t("deliveryHint")}</FieldDescription>
                  </FieldContent>
                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              </FieldLabel>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="deliveryFee"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t("deliveryFee")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={0}
                    onChange={e => field.onChange(Number(e.target.value))}
                    onFocus={e => (e.target as HTMLInputElement).select()}
                    inputMode="decimal"
                  />
                  <FieldDescription>{t("deliveryFree")}</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="currency"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("currency")}</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("currencyPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"KZT"}>KZT</SelectItem>
                      <SelectItem value={"MXN"}>MXN</SelectItem>
                      <SelectItem value={"USD"}>USD</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
          <Field orientation="responsive">
            <div
              className="flex w-full flex-col gap-2 sm:flex-row sm:items-center
                sm:justify-end"
            >
              {secondaryAction}
              <Button
                type="submit"
                disabled={
                  statusUpdate === "executing" || statusCreate === "executing"
                }
              >
                {(statusUpdate === "executing" ||
                  statusCreate === "executing") && (
                  <Loader className="size-4 animate-spin" />
                )}
                <TextMorph>
                  {statusUpdate === "executing" || statusCreate === "executing"
                    ? t("saving")
                    : (submitLabel ??
                      (data ? t("updateBranch") : t("createBranch")))}
                </TextMorph>
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
