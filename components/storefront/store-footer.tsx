import Link from "next/link"
import Image from "next/image"
import { getStoreSettings } from "@/lib/store-settings"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"

export async function StoreFooter() {
  const settings = await getStoreSettings()
  const wa = normalizeWhatsAppNumber(settings?.whatsappNumber)
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="relative isolate overflow-hidden bg-primary py-14 sm:py-20">
        <Image src="/brand/lockup-cream.svg" alt="Ewurahils Fashion" width={760} height={460} className="pointer-events-none absolute left-1/2 top-1/2 w-[min(640px,94vw)] -translate-x-1/2 -translate-y-1/2 opacity-[0.2]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center text-primary-foreground sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.35em] opacity-70">The considered wardrobe</p>
          <p className="mt-3 font-heading text-3xl">Ewurahils Fashion</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Image src="/brand/monogram-green.svg" alt={settings?.storeName ?? "Ewurahils Fashion"} width={230} height={52} className="h-auto w-[190px] dark:hidden" />
            <Image src="/brand/monogram-cream.svg" alt={settings?.storeName ?? "Ewurahils Fashion"} width={230} height={52} className="hidden h-auto w-[190px] dark:block" />
            <p className="mt-2 text-sm text-muted-foreground">{settings?.brandDescription}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop">All products</Link></li>
              <li><Link href="/collections/new-arrivals">New Arrivals</Link></li>
              <li><Link href="/collections/best-sellers">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/policies/shipping">Shipping</Link></li>
              <li><Link href="/policies/returns">Returns</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {settings?.email && <li>{settings.email}</li>}
              {settings?.phone && <li>{settings.phone}</li>}
              {wa && (
                <li>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
            <div className="mt-4 flex gap-3 text-sm">
              {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
              {settings?.tiktok && <a href={settings.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}
              {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
            </div>
          </div>
        </div>
        {settings?.footerContent && (
          <p className="mt-10 whitespace-pre-line text-sm text-muted-foreground">{settings.footerContent}</p>
        )}
        <div className="mt-6 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings?.storeName ?? "Store"}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
