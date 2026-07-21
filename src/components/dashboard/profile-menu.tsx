"use client"

import { useSyncExternalStore } from "react"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import type { AppLocale } from "@/i18n/routing"
import { Globe, LogOut, SunMoon, User } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { getInitials } from "@/lib/utils"

function ProfileMenuTrigger({ disabled = false }: { disabled?: boolean }) {
  const t = useTranslations("dashboard.profile")

  return (
    <button
      type="button"
      className="focus:outline-hidden"
      disabled={disabled}
      aria-label={t("ariaLabel")}
    >
      <Avatar className="size-8">
        <AvatarFallback>BT</AvatarFallback>
      </Avatar>
      <span className="sr-only">{t("ariaLabel")}</span>
    </button>
  )
}

export default function ProfileMenu() {
  const t = useTranslations("dashboard.profile")
  const tLocale = useTranslations("locale")
  const locale = useLocale() as AppLocale
  const { data: session } = authClient.useSession()
  const user = session?.user
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!isMounted) {
    return <ProfileMenuTrigger disabled />
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus:outline-hidden"
          aria-label={t("ariaLabel")}
        >
          <Avatar className="size-8">
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="sr-only">{t("ariaLabel")}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>{t("account")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" prefetch={false}>
            <User className="mr-2 size-4" />
            {t("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon className="mr-2 size-4" />
            <span>{t("theme")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="system">
                  {t("themeSystem")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light">
                  {t("themeLight")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  {t("themeDark")}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="mr-2 size-4" />
            <span>{tLocale("label")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={locale}
                onValueChange={value =>
                  router.replace(pathname, { locale: value as AppLocale })
                }
              >
                <DropdownMenuRadioItem value="en">
                  {tLocale("en")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="es">
                  {tLocale("es")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ru">
                  {tLocale("ru")}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem asChild>
          <Link href="/" prefetch={false}>
            <Globe className="mr-2 size-4" />
            {t("home")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/")
                }
              }
            })
          }
        >
          <LogOut className="mr-2 size-4" />
          <span>{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
