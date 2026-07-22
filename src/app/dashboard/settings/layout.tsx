import { SettingsSecondaryNav } from "@/app/dashboard/settings/settings-secondary-nav"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SettingsSecondaryNav />
      <div className="flex grow pb-4">{children}</div>
    </>
  )
}
