"use client"

import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Menu, ShoppingBag, Search, ArrowUpRight, ChevronRight } from "lucide-react"
import { ThemeToggle } from "@/components/storefront/theme-toggle"
import { useState } from "react"

export function StoreHeader({
  storeName,
  logoUrl,
  brandDescription,
  email,
  whatsappUrl,
}: {
  storeName: string
  logoUrl?: string | null
  brandDescription?: string | null
  email?: string | null
  whatsappUrl?: string | null
}) {
  const count = useCartStore((s) => s.items.reduce((a, b) => a + b.quantity, 0))
  const [open, setOpen] = useState(false)

  const nav = [
    { href: "/shop", label: "Shop" },
    { href: "/collections/new-arrivals", label: "New Arrivals" },
    { href: "/collections/best-sellers", label: "Best Sellers" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center gap-4 px-5 sm:px-8">
        <Sheet open={open} onOpenChange={setOpen}>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <SheetContent side="left" className="w-[min(88vw,390px)] border-r-0 bg-secondary p-0 dark:bg-background">
            <div className="flex h-full flex-col overflow-y-auto p-6 sm:p-8">
              <div className="pr-8">
                <Image src="/brand/wordmark-green.svg" alt={storeName} width={172} height={39} className="h-auto w-[156px] dark:hidden" />
                <Image src="/brand/wordmark-cream.svg" alt={storeName} width={172} height={39} className="hidden h-auto w-[156px] dark:block" />
                <p className="mt-6 max-w-xs text-sm leading-6 text-muted-foreground">
                  {brandDescription ?? "Thoughtful pieces, expressive details, and a wardrobe that stays with you."}
                </p>
              </div>

              <div className="mt-10 border-t border-border pt-6">
                <p className="eyebrow">Explore</p>
                <nav className="mt-3 flex flex-col">
                  {nav.map((n, index) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between border-b border-border/70 py-3.5 font-heading text-2xl transition-colors hover:text-primary"
                    >
                      <span>{n.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      {index === 0 && <span className="sr-only">Browse all products</span>}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <Link href="/shop/clothing" onClick={() => setOpen(false)} className="rounded-sm bg-background p-4 transition-colors hover:bg-muted dark:bg-secondary">
                  <span className="text-muted-foreground">Shop</span><span className="mt-1 block font-medium">Clothing</span>
                </Link>
                <Link href="/shop/accessories" onClick={() => setOpen(false)} className="rounded-sm bg-background p-4 transition-colors hover:bg-muted dark:bg-secondary">
                  <span className="text-muted-foreground">Shop</span><span className="mt-1 block font-medium">Accessories</span>
                </Link>
              </div>

              <div className="mt-auto pt-10">
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground" onClick={() => setOpen(false)}>
                    <span>Chat with our team</span><ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link href="/contact" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
                    <span>Get in touch</span><ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{email ?? "hello@ewurahils.com"}</span>
                  <Link href="/cart" onClick={() => setOpen(false)} className="hover:text-foreground">View bag ({count})</Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 mt-1.5" aria-label={storeName}>
          <Image src={logoUrl ?? "/brand/wordmark-green.svg"} alt={storeName} width={172} height={39} className="h-auto w-[132px] sm:w-[172px] dark:hidden" priority />
          <Image src="/brand/wordmark-cream.svg" alt={storeName} width={172} height={39} className="hidden h-auto w-[132px] sm:w-[172px] dark:block" priority />
        </Link>

        <nav className="ml-8 hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form action="/shop" className="hidden items-center sm:flex">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input name="q" placeholder="Search" className="h-9 w-48 pl-8" />
            </div>
          </form>
          <ThemeToggle />
          <Link href="/cart" className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-muted" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="ml-1 text-xs font-medium">{count}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
