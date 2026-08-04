"use client"

import { useState } from "react"
import { type Location } from "@/generated/prisma-client/client"
import { type Body, type Meta, type UploadResult } from "@uppy/core"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { FileUploader } from "@/components/dashboard/file-uploader"
import { ImageField } from "@/components/dashboard/image-field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from "@/components/ui/stepper"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import NewOrgForm, {
  type BootstrappedOrganization
} from "@/app/(auth)/new-org/new-org-form"
import MenuImportOptions from "@/app/dashboard/menu-items/import-options"
import HoursForm from "@/app/dashboard/settings/locations/hours-form"
import LocationForm from "@/app/dashboard/settings/locations/location-form"
import { ImageType } from "@/lib/types/media"
import { getInitials } from "@/lib/utils"

type StepKey = "organization" | "logo" | "location" | "hours" | "menu"

type SetupOrganization = {
  id: string
  name: string
  slug: string
  logo: string | null
  banner: string | null
}

type SetupLocation = Awaited<ReturnType<typeof getDefaultLocation>>

type CompletedSteps = Record<StepKey, boolean>

const ALL_STEP_ORDER: StepKey[] = [
  "organization",
  "logo",
  "location",
  "hours",
  "menu"
]

const CREATION_STEP_ORDER: StepKey[] = [
  "organization",
  "logo",
  "location",
  "hours",
  "menu"
]

const DEFAULT_STEP_ORDER: StepKey[] = ["logo", "location", "hours", "menu"]

function getReachableSteps(
  activeStep: StepKey,
  stepOrder: StepKey[]
): Record<StepKey, boolean> {
  const activeIndex = stepOrder.indexOf(activeStep)

  return ALL_STEP_ORDER.reduce(
    (steps, step) => {
      const stepIndex = stepOrder.indexOf(step)
      steps[step] = stepIndex !== -1 && stepIndex <= activeIndex
      return steps
    },
    {} as Record<StepKey, boolean>
  )
}

function StepShell({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card
      className="dark:border-border/60 border-0 bg-white/70 backdrop-blur-sm
        dark:border dark:bg-black/30"
    >
      <CardHeader>
        <CardTitle className="text-balance">{title}</CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function OnboardingWizard({
  organization,
  initialLocation,
  initialStep,
  mediaReady,
  locationReady,
  hoursReady,
  menuItemsReady,
  showOrganizationStep = false
}: {
  organization: SetupOrganization | null
  initialLocation: SetupLocation | null
  initialStep: StepKey
  mediaReady: boolean
  locationReady: boolean
  hoursReady: boolean
  menuItemsReady: boolean
  showOrganizationStep?: boolean
}) {
  const t = useTranslations("auth.onboarding")
  const router = useRouter()
  const stepOrder = showOrganizationStep
    ? CREATION_STEP_ORDER
    : DEFAULT_STEP_ORDER
  const stepDetails: Record<
    StepKey,
    { value: StepKey; title: string; description: string }
  > = {
    organization: {
      value: "organization",
      title: t("steps.organization.title"),
      description: t("steps.organization.description")
    },
    logo: {
      value: "logo",
      title: t("steps.logo.title"),
      description: t("steps.logo.description")
    },
    location: {
      value: "location",
      title: t("steps.location.title"),
      description: t("steps.location.description")
    },
    hours: {
      value: "hours",
      title: t("steps.hours.title"),
      description: t("steps.hours.description")
    },
    menu: {
      value: "menu",
      title: t("steps.menu.title"),
      description: t("steps.menu.description")
    }
  }
  const steps = CREATION_STEP_ORDER.map(step => stepDetails[step])
  const [activeStep, setActiveStep] = useState<StepKey>(initialStep)
  const [createdOrganization, setCreatedOrganization] =
    useState<SetupOrganization | null>(null)
  const [location, setLocation] = useState<Location | null>(initialLocation)
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>(() => ({
    organization: !showOrganizationStep || Boolean(organization),
    logo: mediaReady,
    location: locationReady,
    hours: hoursReady,
    menu: menuItemsReady
  }))
  const [logoUploaded, setLogoUploaded] = useState(Boolean(organization?.logo))
  const [bannerUploaded, setBannerUploaded] = useState(
    Boolean(organization?.banner)
  )
  const [isLogoDialogOpen, setLogoDialogOpen] = useState(false)
  const currentOrganization = organization ?? createdOrganization
  const reachableSteps = getReachableSteps(activeStep, stepOrder)
  const hasLogo = logoUploaded || Boolean(currentOrganization?.logo)
  const hasBanner = bannerUploaded || Boolean(currentOrganization?.banner)

  const markStepResolved = (step: StepKey) => {
    setCompletedSteps(current => ({ ...current, [step]: true }))
  }

  const moveToStep = (step: StepKey) => {
    setActiveStep(step)

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set("step", step)
      window.history.replaceState(window.history.state, "", nextUrl)
    }
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  const handleOrganizationCreated = (
    nextOrganization: BootstrappedOrganization
  ) => {
    setCreatedOrganization({
      id: nextOrganization.id,
      name: nextOrganization.name,
      slug: nextOrganization.slug,
      logo: nextOrganization.logo,
      banner: nextOrganization.banner
    })
    markStepResolved("organization")
    moveToStep("logo")
  }

  const handleLogoUploaded = (_result: UploadResult<Meta, Body>) => {
    setLogoUploaded(true)
    setLogoDialogOpen(false)
    markStepResolved("logo")
    router.refresh()
  }

  const handleBannerUploaded = () => {
    setBannerUploaded(true)
    markStepResolved("logo")
    router.refresh()
  }

  const handleLogoContinue = () => {
    markStepResolved("logo")
    moveToStep("location")
  }

  const handleLocationSaved = (nextLocation: Location) => {
    setLocation(nextLocation)
    markStepResolved("location")
    moveToStep("hours")
  }

  const handleLocationSkip = () => {
    setLocation(null)
    markStepResolved("location")
    moveToStep("hours")
  }

  const handleHoursSaved = () => {
    markStepResolved("hours")
    moveToStep("menu")
  }

  const handleFinishHoursStep = () => {
    markStepResolved("hours")
    moveToStep("menu")
  }

  const handleMenuImported = () => {
    markStepResolved("menu")
    goToDashboard()
  }

  const stepDisabled = {
    organization: !reachableSteps.organization,
    logo: !reachableSteps.logo,
    location: !reachableSteps.location,
    hours: !reachableSteps.hours,
    menu: !reachableSteps.menu
  } satisfies Record<StepKey, boolean>

  const menuImportHref = `/dashboard/menu-items/menu-import?returnTo=${encodeURIComponent("/new-org?step=menu")}`
  const hoursData =
    initialLocation && location?.id === initialLocation.id
      ? initialLocation
      : null
  const hasUploadedMedia = hasLogo || hasBanner

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Stepper
        value={activeStep}
        onValueChange={value => moveToStep(value as StepKey)}
        activationMode="manual"
        orientation="vertical"
        className="items-start gap-8"
      >
        <StepperList
          className="w-44 shrink-0 gap-0 self-start rounded-xl bg-white/50 p-3
            backdrop-blur-sm dark:bg-black/20"
        >
          {steps.map(step => (
            <StepperItem
              key={step.value}
              value={step.value}
              completed={completedSteps[step.value]}
              disabled={stepDisabled[step.value]}
              className="items-start"
            >
              <StepperTrigger
                className="w-full justify-start gap-3 rounded-none
                  bg-transparent p-0 pb-3 shadow-none hover:bg-transparent
                  data-[state=active]:bg-transparent
                  data-[state=completed]:bg-transparent"
              >
                <StepperIndicator />
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <StepperTitle>{step.title}</StepperTitle>
                  <StepperDescription>{step.description}</StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator className="ml-3.25 h-6 w-px" />
            </StepperItem>
          ))}
        </StepperList>

        <StepperContent value="organization">
          {showOrganizationStep ? (
            <StepShell
              title={t("organizationStep.title")}
              description={t("organizationStep.description")}
            >
              <NewOrgForm
                withCard={false}
                submitLabel={t("organizationStep.submitLabel")}
                onSuccess={handleOrganizationCreated}
              />
            </StepShell>
          ) : null}
        </StepperContent>

        <StepperContent value="logo">
          <StepShell
            title={t("logoStep.title")}
            description={t("logoStep.description")}
          >
            {currentOrganization ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="size-24 rounded-3xl">
                    {currentOrganization.logo ? (
                      <AvatarImage
                        src={currentOrganization.logo}
                        className="rounded-3xl"
                      />
                    ) : null}
                    <AvatarFallback className="text-3xl">
                      {getInitials(currentOrganization.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="font-medium text-balance">
                        {currentOrganization.name}
                      </p>
                      <p className="text-muted-foreground text-sm text-pretty">
                        {hasUploadedMedia
                          ? t("logoStep.uploadedHint")
                          : t("logoStep.recommendedHint")}
                      </p>
                    </div>
                    <Dialog
                      open={isLogoDialogOpen}
                      onOpenChange={setLogoDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          {hasLogo
                            ? t("logoStep.changeLogo")
                            : t("logoStep.uploadLogo")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>
                            {t("logoStep.uploadImageTitle")}
                          </DialogTitle>
                        </DialogHeader>
                        <FileUploader
                          organizationId={currentOrganization.id}
                          imageType={ImageType.LOGO}
                          objectId={ImageType.LOGO}
                          limitDimension={500}
                          onUploadSuccess={handleLogoUploaded}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium text-balance">
                      {t("logoStep.coverImageTitle")}
                    </p>
                    <p className="text-muted-foreground text-sm text-pretty">
                      {t("logoStep.coverImageHint")}
                    </p>
                  </div>
                  {currentOrganization.banner ? (
                    <ImageField
                      src={currentOrganization.banner}
                      organizationId={currentOrganization.id}
                      imageType={ImageType.BANNER}
                      objectId={ImageType.BANNER}
                      onUploadSuccess={handleBannerUploaded}
                    />
                  ) : (
                    <EmptyImageField
                      organizationId={currentOrganization.id}
                      imageType={ImageType.BANNER}
                      objectId={ImageType.BANNER}
                      onUploadSuccess={handleBannerUploaded}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLogoContinue}
                    >
                      {t("skipForNow")}
                    </Button>
                    <Button
                      type="button"
                      disabled={!hasUploadedMedia}
                      onClick={handleLogoContinue}
                    >
                      {t("continue")}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-pretty">
                {t("logoStep.createBusinessFirst")}
              </p>
            )}
          </StepShell>
        </StepperContent>

        <StepperContent value="location">
          <StepShell
            title={t("locationStep.title")}
            description={t("locationStep.description")}
          >
            <LocationForm
              data={location}
              enabled
              submitLabel={
                location
                  ? t("locationStep.saveChangesContinue")
                  : t("locationStep.saveContinue")
              }
              onSuccess={handleLocationSaved}
              secondaryAction={
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLocationSkip}
                >
                  {t("skipForNow")}
                </Button>
              }
            />
          </StepShell>
        </StepperContent>

        <StepperContent value="hours">
          <StepShell
            title={t("hoursStep.title")}
            description={t("hoursStep.description")}
          >
            {location ? (
              <HoursForm
                data={hoursData}
                locationId={location.id}
                submitLabel={t("hoursStep.saveContinue")}
                onSuccess={handleHoursSaved}
                secondaryAction={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFinishHoursStep}
                  >
                    {t("skipForNow")}
                  </Button>
                }
              />
            ) : (
              <div
                className="border-border/60 flex flex-col gap-4 rounded-2xl
                  border border-dashed p-6"
              >
                <p className="text-muted-foreground text-sm text-pretty">
                  {t("hoursStep.noLocationHint")}
                </p>
                <div
                  className="flex flex-col gap-2 sm:flex-row sm:justify-between"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => moveToStep("location")}
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    {t("back")}
                  </Button>
                  <Button type="button" onClick={handleFinishHoursStep}>
                    {t("hoursStep.continueToProducts")}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            )}
          </StepShell>
        </StepperContent>

        <StepperContent value="menu">
          <StepShell
            title={t("menuStep.title")}
            description={t("menuStep.description")}
          >
            <MenuImportOptions
              aiImportHref={menuImportHref}
              onCsvSuccess={handleMenuImported}
            />
            <div
              className="mt-6 flex flex-col gap-2 sm:flex-row
                sm:justify-between"
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => moveToStep(location ? "hours" : "location")}
              >
                <ArrowLeft className="mr-2 size-4" />
                {t("back")}
              </Button>
              <Button type="button" variant="outline" onClick={goToDashboard}>
                {t("skipForNow")}
              </Button>
            </div>
          </StepShell>
        </StepperContent>
      </Stepper>
    </div>
  )
}
