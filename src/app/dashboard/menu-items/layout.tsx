import { CatalogSecondaryNav } from "@/app/dashboard/menu-items/catalog-secondary-nav"

export default function Layout({
  children,
  modal
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      <CatalogSecondaryNav />
      <div className="relative w-full">{modal}</div>
      <div className="flex grow pb-4">{children}</div>
    </>
  )
}
