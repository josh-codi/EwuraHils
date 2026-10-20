import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/admin/sign-out-button"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")
  const nav = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/collections", label: "Collections" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/banners", label: "Banners" },
    { href: "/admin/homepage", label: "Homepage" },
    { href: "/admin/media", label: "Media" },
    { href: "/admin/delivery", label: "Delivery" },
    { href: "/admin/settings", label: "Settings" },
  ]
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 border-r border-border bg-secondary/30 p-4 md:block">
        <Link href="/admin" className="font-heading text-lg">
          Admin
        </Link>
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-3 py-2 hover:bg-muted">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 text-xs text-muted-foreground">
          {session.user.email}
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
          <span className="font-heading md:hidden">Admin</span>
          <SignOutButton />
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}