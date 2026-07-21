"use client"

import {
  Fragment,
  use,
  useEffect,
  useRef,
  useState,
  useTransition
} from "react"
import toast from "react-hot-toast"
import { Link } from "@/i18n/navigation"
import * as Sentry from "@sentry/nextjs"
import { type feedbackIntegration } from "@sentry/nextjs"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ChevronRight,
  ChevronsUpDown,
  Crown,
  Images,
  LayoutTemplate,
  Megaphone,
  Plus,
  Settings,
  ShoppingBag,
  type LucideIcon
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment
} from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { switchOrganization } from "@/server/actions/user/mutations"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { authClient } from "@/lib/auth-client"
import { Plan } from "@/lib/types/billing"
import { getInitials } from "@/lib/utils"

type NavigationItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: NavigationItem[]
}

function useNavigationItems(): NavigationItem[] {
  const t = useTranslations("dashboard.nav")

  return [
    { title: t("menus"), url: "/dashboard", icon: LayoutTemplate },
    {
      title: t("catalog"),
      url: "/dashboard/menu-items",
      icon: ShoppingBag,
      items: [
        { title: t("products"), url: "/dashboard/menu-items" },
        { title: t("categories"), url: "/dashboard/menu-items/categories" },
        { title: t("translations"), url: "/dashboard/menu-items/translations" }
      ]
    },
    { title: t("media"), url: "/dashboard/media", icon: Images },
    {
      title: t("settings"),
      url: "/dashboard/settings",
      icon: Settings,
      items: [
        { title: t("general"), url: "/dashboard/settings" },
        { title: t("location"), url: "/dashboard/settings/locations" },
        { title: t("members"), url: "/dashboard/settings/members" },
        { title: t("billing"), url: "/dashboard/settings/billing" }
      ]
    }
  ]
}

export default function AppSidebar({
  promiseOrganization
}: {
  promiseOrganization: ReturnType<typeof getCurrentOrganization>
}) {
  const currentOrg = use(promiseOrganization)
  const navigation = useNavigationItems()
  const tSidebar = useTranslations("dashboard.sidebar")
  const { isMobile, setOpenMobile } = useSidebar()

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <>
      <SidebarWorkgroup onNavigate={closeMobileSidebar} />
      <SidebarContent>
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map(item => (
                <Fragment key={item.title}>
                  {item.items ? (
                    <Collapsible
                      asChild
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight
                              className="ml-auto transition-transform
                                duration-200
                                group-data-[state=open]/collapsible:rotate-90"
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map(subItem => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarSubLink
                                  item={subItem}
                                  onNavigate={closeMobileSidebar}
                                />
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem>
                      <SidebarLink
                        item={item}
                        onNavigate={closeMobileSidebar}
                      />
                    </SidebarMenuItem>
                  )}
                </Fragment>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {currentOrg?.plan === Plan.BASIC && (
          <div className="p-1">
            <Card
              className="border-indigo-400/50 bg-radial-[at_0%_100%]
                from-pink-500/50 via-indigo-500/20 to-transparent shadow-none"
            >
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">
                  <Crown
                    className="mr-1.5 inline size-4 align-text-top
                      text-amber-600 dark:text-amber-500"
                  />
                  {tSidebar("upgradeTitle")}
                </CardTitle>
                <CardDescription
                  className="dark:text-foreground/80 text-foreground/60 text-xs"
                >
                  {tSidebar("upgradeDescription")}
                </CardDescription>
              </CardHeader>
              <CardFooter className="px-3">
                <Button size="xs" variant="default" className="w-full" asChild>
                  <Link
                    href="/dashboard/settings/billing"
                    prefetch={false}
                    onClick={closeMobileSidebar}
                  >
                    {tSidebar("upgradeCta")}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <AttachToFeedbackButton />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </>
  )
}

function SidebarLink({
  item,
  onNavigate
}: {
  item: NavigationItem
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment()

  let isActive = false
  if (!segment || segment === "(start)") {
    isActive = pathname?.includes(item.url) ?? false
  } else {
    isActive = item.url.includes(segment)
  }

  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={item.url} prefetch={false} onClick={onNavigate}>
        {item.icon && <item.icon />}
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  )
}

function SidebarSubLink({
  item,
  onNavigate
}: {
  item: NavigationItem
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const isActive = item.url === pathname

  return (
    <SidebarMenuSubButton asChild isActive={isActive}>
      <Link href={item.url} prefetch={false} onClick={onNavigate}>
        <span>{item.title}</span>
      </Link>
    </SidebarMenuSubButton>
  )
}

function SidebarWorkgroup({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("dashboard.sidebar")
  const { data: organizations, refetch } = authClient.useListOrganizations()

  const { data: currentOrg } = useQuery({
    queryKey: ["workgroup", "current"],
    queryFn: async () => {
      refetch()
      return await getCurrentOrganization()
    }
  })

  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const { execute } = useAction(switchOrganization, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        // Revalidate the current organization
        queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })
        // router.replace("/dashboard")
        startTransition(() => {
          router.replace("/dashboard")
        })
        onNavigate?.()
      } else if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      }
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "sidebar-switch-org" }
      })
      toast.error(t("switchOrgError"))
    },
    onSettled: () => {
      refetch()
    }
  })

  const handleSwitchOrganization = async (organizationId: string) => {
    await execute({
      organizationId,
      currentOrganizationId: currentOrg?.id ?? ""
    })
  }

  if (isPending) return <SkeletonWorkgroup />

  if (!currentOrg && organizations?.length === 0)
    return (
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton asChild size="lg">
            <Link
              href="/dashboard/create-org"
              prefetch={false}
              onClick={onNavigate}
            >
              <div
                className="border-sidebar-border grid size-8 place-items-center
                  rounded-sm border shadow-sm"
              >
                <Plus className="size-4" />
              </div>
              <span className="truncate font-semibold">
                {t("createOrganization")}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
    )

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent
                  data-[state=open]:text-sidebar-accent-foreground"
              >
                {currentOrg ? (
                  <>
                    <div
                      className="bg-sidebar-primary
                        text-sidebar-primary-foreground flex aspect-square
                        size-8 items-center justify-center rounded-lg"
                    >
                      <Avatar className="size-8 rounded-sm shadow-sm">
                        <AvatarImage src={currentOrg.logo ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(currentOrg.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {currentOrg.name}
                      </span>
                      <span className="truncate text-xs">
                        {currentOrg.plan === Plan.BASIC
                          ? t("planBasic")
                          : t("planPro")}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="truncate">{t("selectBusiness")}</span>
                )}
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56
                rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {t("organizations")}
              </DropdownMenuLabel>
              {organizations?.map(organization => (
                <DropdownMenuItem
                  key={organization.name}
                  onClick={() => handleSwitchOrganization(organization.id)}
                  className="gap-2 p-2"
                >
                  {/* <div className="flex size-6 items-center justify-center rounded-xs border">
                    <Avatar className="size-5 rounded-xs shadow-sm">
                      <AvatarImage src={organization.logo ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(organization.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div> */}
                  {organization.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="gap-2 p-2">
                <Link
                  href="/dashboard/create-org"
                  prefetch={false}
                  onClick={onNavigate}
                  className="flex items-center gap-2"
                >
                  <div
                    className="border-sidebar-border flex size-6 items-center
                      justify-center rounded-md border"
                  >
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {t("addOrganization")}
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}

export function SkeletonWorkgroup() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="flex flex-row items-center gap-2 p-1.5">
          <Skeleton className="bg-sidebar-accent size-8" />
          <Skeleton className="bg-sidebar-accent h-6 w-24" />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}

function AttachToFeedbackButton() {
  const t = useTranslations("dashboard.sidebar")
  // Explicitly set the state type to any (adjust as needed).
  const [feedback, setFeedback] =
    useState<ReturnType<typeof feedbackIntegration>>()
  useEffect(() => {
    setFeedback(Sentry.getFeedback())
  }, [])

  // Set the Sentry user based on the current user.
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (Sentry) {
      Sentry.setUser({
        name: session?.user?.name,
        email: session?.user?.email
      })
    }
  }, [session?.user?.email, session?.user?.name])

  // Type the ref as an HTMLButtonElement.
  const elRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    if (feedback && elRef.current) {
      const unsubscribe = feedback.attachTo(elRef.current)
      return () => unsubscribe?.()
    }
  }, [feedback])

  return (
    <SidebarMenuButton asChild size="sm">
      <a href="#" ref={elRef}>
        <Megaphone />
        <span>{t("reportIssue")}</span>
      </a>
    </SidebarMenuButton>
  )
}
