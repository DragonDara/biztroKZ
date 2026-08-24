"use client"

import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import slugify from "@sindresorhus/slugify"
import { useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { type z } from "zod/v4"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { bootstrapOrg } from "@/server/actions/organization/mutations"
import { authClient } from "@/lib/auth-client"
import { orgSchema } from "@/lib/types/organization"
import { OrganizationStatus, Plan } from "@/lib/types/plan"

export type BootstrappedOrganization = {
  id: string
  name: string
  slug: string
  description: string | null
  status: OrganizationStatus
  plan: Plan
  logo: string | null
  banner: string | null
}

export default function NewOrgForm({
  onSuccess,
  submitLabel,
  redirectTo,
  withCard = true
}: {
  onSuccess?: (organization: BootstrappedOrganization) => void
  submitLabel?: string
  redirectTo?: string
  withCard?: boolean
}) {
  const t = useTranslations("auth.onboarding.form")
  const form = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      status: OrganizationStatus.ACTIVE,
      plan: Plan.BASIC
    }
  })
  const router = useRouter()

  const slug = useWatch({
    control: form.control,
    name: "name",
    defaultValue: "mi-negocio"
  })
  const queryClient = useQueryClient()

  useEffect(() => {
    form.setValue("slug", slugify(slug))
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const { execute, status, reset } = useAction(bootstrapOrg, {
    onSuccess: async ({ data }) => {
      if (data?.failure) {
        toast.error(data.failure.reason ?? t("genericError"))
        reset()
        return
      } else if (data?.success) {
        const organization = data.success as BootstrappedOrganization

        const { error } = await authClient.organization.setActive({
          organizationId: organization.id
        })

        if (error) {
          toast.error(t("activateError"))
          reset()
          return
        }

        queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })
        router.refresh()

        if (onSuccess) {
          onSuccess(organization)
        } else {
          router.push(redirectTo ?? "/dashboard")
        }
      }
      reset()
    },
    onError: () => {
      toast.error(t("updateError"))
      reset()
    }
  })

  const onSubmit = (data: z.infer<typeof orgSchema>) => {
    execute(data)
  }

  const fields = (
    <fieldset className="space-y-4">
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("nameLabel")}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder={t("namePlaceholder")}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t("descriptionLabel")}
            </FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder={t("descriptionPlaceholder")}
            />
            <FieldDescription>{t("descriptionHint")}</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="slug"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>{t("websiteLabel")}</FieldLabel>
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
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </fieldset>
  )

  const submitButton = (
    <Button
      disabled={status === "executing"}
      type="submit"
      className={withCard ? "w-full" : undefined}
    >
      {status === "executing" ? (
        <Loader className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        (submitLabel ?? t("submitLabel"))
      )}
    </Button>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {withCard ? (
          <Card className="min-w-96 shadow-xl">
            <CardHeader>
              <CardTitle>{t("generalTitle")}</CardTitle>
            </CardHeader>
            <CardContent>{fields}</CardContent>
            <CardFooter>{submitButton}</CardFooter>
          </Card>
        ) : (
          <>
            {fields}
            <div className="flex justify-end">{submitButton}</div>
          </>
        )}
      </form>
    </Form>
  )
}
