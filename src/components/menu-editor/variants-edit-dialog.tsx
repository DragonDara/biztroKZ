"use client"

import * as React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader, PlusCircle, Trash } from "lucide-react"
import { useTranslations } from "next-intl"
import { TextMorph } from "torph/react"
import { z } from "zod/v4"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
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
import type { MenuItemRow } from "./types"

type VariantsFormValues = {
  variants: Array<{
    id: string
    name: string
    price: number
    description?: string | null
    menuItemId: string
  }>
}

interface VariantsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MenuItemRow | null
  onSave: (itemId: string, variants: MenuItemRow["variants"]) => void
}

export function VariantsEditDialog({
  open,
  onOpenChange,
  item,
  onSave
}: VariantsEditDialogProps) {
  const t = useTranslations("menuEditor.dataGrid.variantsEdit")
  const tVariants = useTranslations("dashboard.menuItems.variants")
  const tCommon = useTranslations("dashboard.common")

  const variantsFormSchema = React.useMemo(
    () =>
      z.object({
        variants: z
          .array(
            z.object({
              id: z.string(),
              name: z
                .string()
                .min(1, t("nameRequired"))
                .max(100, t("nameTooLong")),
              price: z.number().min(0, t("priceNegative")),
              description: z.string().optional().nullable(),
              menuItemId: z.string()
            })
          )
          .min(1, t("minOneVariant"))
      }),
    [t]
  )

  const form = useForm<VariantsFormValues>({
    resolver: zodResolver(variantsFormSchema),
    defaultValues: {
      variants: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  })

  React.useEffect(() => {
    if (item) {
      form.reset({
        variants: item.variants.map(v => ({
          id: v.id,
          name: v.name,
          price: v.price,
          description: v.description ?? null,
          menuItemId: v.menuItemId
        }))
      })
    }
  }, [item, form])

  const handleSubmit = (values: VariantsFormValues) => {
    if (!item) return
    onSave(item.id, values.variants)
  }

  const handleAddVariant = () => {
    if (!item) return
    append({
      id: `new-${Date.now()}`,
      name: "",
      price: 0,
      description: null,
      menuItemId: item.id
    })
  }

  const handleRemoveVariant = (index: number) => {
    if (fields.length <= 1) return
    remove(index)
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title", { name: item.name })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="max-h-100 overflow-y-auto py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-50">
                    {tVariants("columnName")}
                  </TableHead>
                  <TableHead className="w-37.5">
                    {tVariants("columnPrice")}
                  </TableHead>
                  <TableHead className="w-20">
                    {tVariants("columnActions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        name={`variants.${index}.name`}
                        control={form.control}
                        render={({ field: inputField, fieldState }) => (
                          <Field className="space-y-0">
                            <FieldLabel
                              htmlFor={inputField.name}
                              className="sr-only"
                            >
                              {tVariants("nameLabel")}
                            </FieldLabel>
                            <Input
                              {...inputField}
                              id={inputField.name}
                              placeholder={tVariants("namePlaceholder")}
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
                        control={form.control}
                        render={({ field: inputField, fieldState }) => (
                          <Field className="space-y-0">
                            <FieldLabel
                              htmlFor={inputField.name}
                              className="sr-only"
                            >
                              {tVariants("priceLabel")}
                            </FieldLabel>
                            <Input
                              {...inputField}
                              id={inputField.name}
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min={0}
                              placeholder={tVariants("pricePlaceholder")}
                              onChange={e =>
                                inputField.onChange(Number(e.target.value))
                              }
                              onFocus={e =>
                                (e.target as HTMLInputElement).select()
                              }
                              value={inputField.value ?? ""}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={fields.length <= 1}
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <Trash className="size-3.5 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddVariant}
              className="mt-4 w-full gap-1"
            >
              <PlusCircle className="size-3.5" />
              {t("addVariant")}
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader className="mr-2 size-4 animate-spin" />
              )}
              <TextMorph>
                {form.formState.isSubmitting ? t("saving") : t("saveChanges")}
              </TextMorph>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
