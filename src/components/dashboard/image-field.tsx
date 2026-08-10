"use client"

import { useState } from "react"
import { ImageUp } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { FileUploader } from "@/components/dashboard/file-uploader"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { type ImageType } from "@/lib/types/media"
import { cn } from "@/lib/utils"

export function ImageField({
  organizationId,
  src,
  imageType,
  objectId,
  onUploadSuccess,
  className
}: {
  organizationId: string
  src: string
  imageType: ImageType
  objectId: string
  onUploadSuccess?: () => void
  className?: string
}) {
  const t = useTranslations("dashboard.common")
  const [open, setOpen] = useState(false)
  // Track which src failed so a new src clears the error without useEffect.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasError = failedSrc === src

  if (hasError) {
    return (
      <EmptyImageField
        organizationId={organizationId}
        imageType={imageType}
        objectId={objectId}
        onUploadSuccess={onUploadSuccess}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        `group/image-field bg-muted relative min-h-64 w-full overflow-hidden
        rounded-lg`,
        className
      )}
    >
      <Image
        src={src}
        alt={t("photoAlt")}
        className="h-full w-full object-cover"
        loading="lazy"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        unoptimized
        onError={() => setFailedSrc(src)}
      />
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/50
          opacity-100 backdrop-blur transition-opacity md:opacity-0
          md:group-hover/image-field:opacity-100"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="border border-white/50 bg-transparent
                hover:bg-white/10"
            >
              <ImageUp className="mr-2 size-4" />
              {t("changeImage")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{t("uploadImage")}</DialogTitle>
            </DialogHeader>
            <FileUploader
              organizationId={organizationId}
              imageType={imageType}
              objectId={objectId}
              onUploadSuccess={() => {
                onUploadSuccess?.()
                setOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
