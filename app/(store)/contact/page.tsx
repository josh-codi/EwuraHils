import { getStoreSettings } from "@/lib/store-settings"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"
import Link from "next/link"

export const revalidate = 60

export default async function ContactPage() {
  const s = await getStoreSettings()
  const wa = normalizeWhatsAppNumber(s?.whatsappNumber)
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
      <p className="eyebrow">We would love to hear from you</p>
      <div className="mt-5 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24">
        <div>
          <h1 className="font-heading text-5xl leading-none sm:text-7xl">Let’s talk style.</h1>
          <p className="mt-7 max-w-md leading-7 text-muted-foreground">Questions about fit, delivery, or putting a look together? Our team is here to make your shopping experience easy and personal.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div><p className="eyebrow">Visit</p><p className="mt-3 whitespace-pre-line text-sm leading-6">{s?.address ?? "Osu, Accra\nGhana"}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{s?.openingHours ?? "Monday – Saturday: 10:00 – 18:00"}</p></div>
            <div><p className="eyebrow">Reach us</p>{s?.email && <p className="mt-3 text-sm">{s.email}</p>}{s?.phone && <p className="mt-2 text-sm text-muted-foreground">{s.phone}</p>}</div>
          </div>
        </div>
        <div className="rounded-sm bg-secondary p-8 sm:p-12">
          <p className="font-heading text-3xl">Personal shopping, via WhatsApp.</p>
          <p className="mt-4 leading-7 text-muted-foreground">Send us a note and we can help with sizing, styling, availability, or a special request.</p>
          {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground">Message us on WhatsApp</a>}
          {!wa && <Link href="/shop" className="mt-7 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground">Continue shopping</Link>}
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-sm leading-7 text-muted-foreground">
        {wa && (
          <p>Customer care is available on WhatsApp during opening hours.</p>
        )}
        {s?.customerServiceInfo && <p className="whitespace-pre-line">{s.customerServiceInfo}</p>}
      </div>
    </div>
  )
}
