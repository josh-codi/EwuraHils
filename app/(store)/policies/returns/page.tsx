import { getStoreSettings } from "@/lib/store-settings"

export const revalidate = 60

export default async function ReturnsPolicyPage() {
  const s = await getStoreSettings()
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
      <p className="eyebrow">The practical details</p>
      <h1 className="mt-4 font-heading text-5xl sm:text-7xl">Returns & exchanges</h1>
      <div className="mt-10 grid gap-8 border-y border-border py-8 sm:grid-cols-3">
        <div><p className="font-medium">7 days</p><p className="mt-2 text-sm text-muted-foreground">To request a return</p></div>
        <div><p className="font-medium">Unworn</p><p className="mt-2 text-sm text-muted-foreground">Original tags and packaging</p></div>
        <div><p className="font-medium">Message first</p><p className="mt-2 text-sm text-muted-foreground">We will guide you personally</p></div>
      </div>
      <div className="mt-8 max-w-2xl whitespace-pre-line text-base leading-8 text-muted-foreground">{s?.returnsPolicy ?? "We want you to love your pieces. Returns or exchanges can be requested within 7 days of delivery, provided the item is unworn, unwashed, and returned with its original tags and packaging.\n\nSale items and personalised pieces are final sale. Please contact us on WhatsApp before sending anything back so we can guide you through the process."}</div>
    </div>
  )
}
