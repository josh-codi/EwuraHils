import { getStoreSettings } from "@/lib/store-settings"
import Link from "next/link"

export const revalidate = 60

export default async function AboutPage() {
  const s = await getStoreSettings()
  const content = s?.aboutContent ?? "Ewurahils is a Ghanaian fashion destination built around the beauty of considered choices. We curate modern clothing, accessories, shoes, and bags that feel effortless today and remain relevant long after the season changes.\n\nOur edit is guided by texture, proportion, and the little details that make getting dressed feel personal."
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
      <p className="eyebrow">Our point of view</p>
      <div className="mt-5 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24">
        <div>
          <h1 className="font-heading text-5xl leading-[0.98] sm:text-7xl">Dress with intention.</h1>
          <div className="mt-8 max-w-2xl whitespace-pre-line text-base leading-8 text-muted-foreground">{content}</div>
          <Link href="/shop" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground">Explore the edit</Link>
        </div>
        <div className="self-end border-t border-border pt-6">
          <p className="font-heading text-2xl">A wardrobe with staying power.</p>
          <div className="mt-8 grid gap-6 text-sm text-muted-foreground">
            <div><p className="font-medium text-foreground">Considered</p><p className="mt-1">Every piece earns its place through texture, shape, and wearability.</p></div>
            <div><p className="font-medium text-foreground">Personal</p><p className="mt-1">Style is a conversation. We are here to help you make it yours.</p></div>
            <div><p className="font-medium text-foreground">Made for real life</p><p className="mt-1">Easy silhouettes and expressive details for the days you actually live.</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
