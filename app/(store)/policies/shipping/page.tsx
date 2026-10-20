import { getStoreSettings } from "@/lib/store-settings"

export const revalidate = 60

export default async function ShippingPolicyPage() {
  const s = await getStoreSettings()
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
      <p className="eyebrow">The practical details</p>
      <h1 className="mt-4 font-heading text-5xl sm:text-7xl">Shipping</h1>
      <div className="mt-10 grid gap-8 border-y border-border py-8 sm:grid-cols-3">
        <div><p className="font-medium">Accra</p><p className="mt-2 text-sm text-muted-foreground">1–2 working days</p></div>
        <div><p className="font-medium">Other regions</p><p className="mt-2 text-sm text-muted-foreground">2–5 working days</p></div>
        <div><p className="font-medium">Confirmation</p><p className="mt-2 text-sm text-muted-foreground">Personal WhatsApp update</p></div>
      </div>
      <div className="mt-8 max-w-2xl whitespace-pre-line text-base leading-8 text-muted-foreground">{s?.shippingPolicy ?? "We deliver across Accra and Ghana. Accra orders typically arrive within 1–2 working days; deliveries to other regions take 2–5 working days.\n\nDelivery fees are calculated by zone at checkout. You will receive a WhatsApp confirmation before your order is dispatched."}</div>
    </div>
  )
}
