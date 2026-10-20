import Link from "next/link"
import Image from "next/image"
import { getHomepageSections, getPublishedProducts, getCategories, getActiveBanners } from "@/lib/queries"
import { getStoreSettings } from "@/lib/store-settings"
import { ProductCard } from "@/components/products/product-card"

export const revalidate = 60

export default async function HomePage() {
  const [sections, settings, categories, heroBanners] = await Promise.all([
    getHomepageSections(),
    getStoreSettings(),
    getCategories(),
    getActiveBanners("hero"),
  ])

  const featuredProducts = await getPublishedProducts({ featured: true, take: 8 })
  const newArrivals = await getPublishedProducts({ newArrival: true, take: 8 })

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.storeName ?? "Ewurahils",
    url: siteUrl,
    logo: settings?.logoMedia?.url,
    description: settings?.brandDescription ?? undefined,
    sameAs: [settings?.instagram, settings?.tiktok, settings?.facebook].filter(
      (v): v is string => Boolean(v)
    ),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationLd).replace(/</g, "\\u003c"),
        }}
      />
      {sections.map((section) => {
        switch (section.type) {
          case "hero": {
            const heroBanner = section.banner ?? heroBanners[0] ?? null
            const hasMedia = Boolean(heroBanner?.mediaAsset?.url)
            return (
              <section key={section.id} className="relative overflow-hidden">
                <div className={`relative h-[min(78vh,820px)] min-h-[590px] w-full ${hasMedia ? "bg-muted" : "bg-[#163F32]"}`}>
                  {hasMedia ? (
                    heroBanner?.mediaAsset?.resourceType === "VIDEO" ? (
                      <video
                        src={heroBanner.mediaAsset.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={heroBanner!.mediaAsset!.url}
                        alt={heroBanner?.headline ?? "Hero"}
                        fill
                        priority
                        className="object-cover"
                      />
                    )
                  ) : null}
                  <div
                    className={`absolute inset-0 flex items-end p-6 sm:p-12 lg:p-20 ${
                      hasMedia
                        ? "bg-gradient-to-t from-black/75 via-black/35 to-black/10"
                        : "bg-[radial-gradient(circle_at_75%_20%,rgba(213,240,120,0.18),transparent_45%)]"
                    }`}
                  >
                    <div className={`max-w-2xl ${hasMedia ? "text-white" : "text-[#F7F5EF]"}`}>
                      <p className="text-[11px] font-medium uppercase tracking-[0.32em] opacity-80">
                        {settings?.storeName ?? "The Edit"}
                      </p>
                      <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.95] sm:text-7xl lg:text-8xl">
                        {heroBanner?.headline ?? section.headline ?? "A considered wardrobe"}
                      </h1>
                      {(heroBanner?.subtitle || section.description || settings?.brandDescription) && (
                        <p className="mt-6 max-w-md text-base leading-relaxed opacity-85 sm:text-lg">
                          {heroBanner?.subtitle ?? section.description ?? settings?.brandDescription}
                        </p>
                      )}
                      <a
                        href={heroBanner?.ctaUrl ?? "/shop"}
                        className={`mt-8 inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-medium transition-colors ${
                          hasMedia
                            ? "bg-primary text-primary-foreground hover:bg-primary/80"
                            : "bg-[#D5F078] text-[#163F32] hover:bg-[#c8e468]"
                        }`}
                      >
                        {heroBanner?.ctaLabel ?? "Shop the collection"}
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            )
          }
          case "featured-categories":
            if (categories.length === 0) return null
            return (
              <section key={section.id} className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:py-28">
                <div className="flex items-end justify-between gap-4">
                  <div><p className="eyebrow">The wardrobe</p><h2 className="mt-3 font-heading text-4xl sm:text-5xl">Shop by category</h2></div>
                  <Link href="/shop" className="hidden text-sm underline-offset-4 hover:underline sm:block">View all pieces</Link>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop/${c.slug}`}
                      className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-muted"
                    >
                      {c.coverMedia?.url && (
                        <Image src={c.coverMedia.url} alt={c.name} fill className="object-cover transition-transform group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                        <span className="font-medium text-white">{c.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          case "new-arrivals":
            if (newArrivals.items.length === 0) return null
            return (
              <section key={section.id} className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <div className="flex items-end justify-between">
                  <div><p className="eyebrow">Just in</p><h2 className="mt-3 font-heading text-4xl sm:text-5xl">{section.headline ?? "New Arrivals"}</h2></div>
                  <Link href="/shop?sort=newest" className="text-sm text-muted-foreground hover:text-foreground">
                    View all
                  </Link>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
                  {newArrivals.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )
          case "featured-products":
            if (featuredProducts.items.length === 0) return null
            return (
              <section key={section.id} className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <p className="eyebrow">The edit</p><h2 className="mt-3 font-heading text-4xl sm:text-5xl">{section.headline ?? "Featured"}</h2>
                <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
                  {featuredProducts.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )
          case "selected-collection": {
            const col = section.collection
            if (!col || !col.published || col.products.length === 0) return null
            return (
              <section key={section.id} className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <h2 className="font-heading text-3xl">{col.name}</h2>
                {col.description && <p className="mt-2 text-muted-foreground">{col.description}</p>}
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {col.products.map((cp) => (
                    <ProductCard key={cp.product.id} product={cp.product} />
                  ))}
                </div>
              </section>
            )
          }
          case "promotional-banner":
          case "campaign-video": {
            const b = section.banner
            if (!b) return null
            const hasMedia = Boolean(b.mediaAsset?.url)
            return (
              <section key={section.id} className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:py-16">
                <div className={`relative overflow-hidden rounded-sm ${hasMedia ? "bg-muted" : "bg-[#163F32]"}`}>
                  <div className="relative aspect-[16/7] w-full">
                    {hasMedia ? (
                      b.mediaAsset!.resourceType === "VIDEO" ? (
                        <video src={b.mediaAsset!.url} muted autoPlay loop playsInline className="h-full w-full object-cover" />
                      ) : (
                        <Image src={b.mediaAsset!.url} alt={b.headline ?? ""} fill className="object-cover" />
                      )
                    ) : null}
                  </div>
                  <div
                    className={`absolute inset-0 flex items-center p-7 sm:p-14 ${
                      hasMedia ? "bg-gradient-to-r from-black/70 via-black/30 to-transparent" : ""
                    }`}
                  >
                    <div className={`max-w-md ${hasMedia ? "text-white drop-shadow" : "text-[#F7F5EF]"}`}>
                      {b.headline && <h3 className="font-heading text-4xl leading-tight sm:text-5xl">{b.headline}</h3>}
                      {b.subtitle && <p className="mt-4 max-w-sm leading-relaxed opacity-90">{b.subtitle}</p>}
                      {b.ctaLabel && b.ctaUrl && (
                        <a
                          href={b.ctaUrl}
                          className={`mt-4 inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium ${
                            hasMedia
                              ? "bg-primary text-primary-foreground hover:bg-primary/80"
                              : "bg-[#D5F078] text-[#163F32] hover:bg-[#c8e468]"
                          }`}
                        >
                          {b.ctaLabel}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )
          }
          case "brand-story":
            return (
              <section key={section.id} className="bg-secondary/40 py-20">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                  <h2 className="font-heading text-3xl">{section.headline ?? "Our Story"}</h2>
                  <p className="mt-4 text-muted-foreground">
                    {section.description ?? settings?.brandDescription ?? settings?.aboutContent}
                  </p>
                </div>
              </section>
            )
          case "social":
            if (!settings?.instagram && !settings?.tiktok && !settings?.facebook) return null
            return (
              <section key={section.id} className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <h2 className="font-heading text-3xl">{section.headline ?? "Follow Us"}</h2>
                <div className="mt-6 flex gap-4 text-sm">
                  {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>}
                  {settings?.tiktok && <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="underline">TikTok</a>}
                  {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="underline">Facebook</a>}
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
