import { getStoreSettings } from "@/lib/store-settings"
import { StoreHeader } from "@/components/storefront/store-header"
import { StoreFooter } from "@/components/storefront/store-footer"
import { WhatsAppFab } from "@/components/storefront/whatsapp-fab"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings()
  return (
    <div className="flex min-h-svh flex-col">
      {settings?.announcementVisible && settings.announcementText && (
        <div className="bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
          {settings.announcementText}
        </div>
      )}
      <StoreHeader
        storeName={settings?.storeName ?? "Store"}
        logoUrl={settings?.logoMedia?.url ?? null}
        brandDescription={settings?.brandDescription}
        email={settings?.email}
        whatsappUrl={normalizeWhatsAppNumber(settings?.whatsappNumber) ? `https://wa.me/${normalizeWhatsAppNumber(settings?.whatsappNumber)}` : null}
      />
      <main className="flex-1">{children}</main>
      <WhatsAppFab />
      <StoreFooter />
    </div>
  )
}
