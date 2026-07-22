"use client"

// legacy Form helpers removed in favor of Field primitives
import {
  Controller,
  type Control,
  type FieldArrayWithId,
  type UseFormReturn
} from "react-hook-form"
import { Trash } from "lucide-react"
import { useTranslations } from "next-intl"
import type { z } from "zod/v4"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import VariantDelete from "@/app/dashboard/menu-items/[action]/[id]/variant-delete"
import type { menuItemFormSchema } from "@/lib/types/menu-item"

type VariantFormValues = z.infer<typeof menuItemFormSchema>

export default function VariantForm({
  fieldArray,
  parentForm
}: {
  fieldArray: FieldArrayWithId<VariantFormValues>[]
  parentForm: UseFormReturn<VariantFormValues>
}) {
  return (
    <>
      {fieldArray.length > 1 ? (
        <MultiVariantForm fieldArray={fieldArray} parentForm={parentForm} />
      ) : (
        <SingleVariantForm control={parentForm.control} />
      )}
    </>
  )
}

function MultiVariantForm({
  fieldArray,
  parentForm
}: {
  fieldArray: FieldArrayWithId<VariantFormValues>[]
  parentForm: UseFormReturn<VariantFormValues>
}) {
  const t = useTranslations("dashboard.menuItems.variants")

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("columnName")}</TableHead>
          <TableHead>{t("columnPrice")}</TableHead>
          <TableHead>{t("columnActions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fieldArray.map((field, index) => (
          <TableRow key={field.id}>
            <TableCell>
              <Controller
                name={`variants.${index}.name`}
                control={parentForm.control}
                render={({ field, fieldState }) => (
                  <Field className="space-y-0">
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      {t("nameLabel")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={t("namePlaceholder")}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </TableCell>
            <TableCell>
              <Controller
                name={`variants.${index}.price`}
                control={parentForm.control}
                render={({ field, fieldState }) => (
                  <Field className="space-y-0">
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      {t("priceLabel")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      placeholder={t("pricePlaceholder")}
                      onChange={e => field.onChange(Number(e.target.value))}
                      onFocus={e => (e.target as HTMLInputElement).select()}
                      value={field.value ?? ""}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </TableCell>
            <TableCell className="flex justify-center">
              <VariantDelete
                variantId={parentForm.getValues(`variants.${index}.id`)}
                menuItemId={parentForm.getValues(
                  `variants.${index}.menuItemId`
                )}
              >
                <Button type="button" variant="ghost">
                  <Trash className="size-3.5 text-red-500" />
                </Button>
              </VariantDelete>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function SingleVariantForm({
  control
}: {
  control: Control<VariantFormValues>
}) {
  const t = useTranslations("dashboard.menuItems.variants")

  return (
    <Controller
      name={"variants.0.price"}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>{t("priceLabel")}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            type="number"
            inputMode="numeric"
            placeholder={t("pricePlaceholder")}
            className="w-1/3"
            onChange={e => field.onChange(Number(e.target.value))}
            onFocus={e => (e.target as HTMLInputElement).select()}
            value={field.value ?? ""}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
