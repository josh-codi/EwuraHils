import Link from "next/link"
import { getPublishedProducts, getCategories } from "@/lib/queries"
import { ProductCard } from "@/components/products/product-card"

export const revalidate = 60

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : undefined
  const category = typeof sp.category === "string" ? sp.category : undefined
  const sort = typeof sp.sort === "string" ? sp.sort : undefined
  const availability = typeof sp.availability === "string" ? sp.availability : undefined
  const page = Number(sp.page ?? 1) || 1
  const pageSize = 24

  const [{ items, total }, categories] = await Promise.all([
    getPublishedProducts({
      search: q,
      categorySlug: category,
      sort,
      inStock: availability === "in-stock",
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    getCategories(),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-20">
      <p className="eyebrow">The full edit</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-heading text-5xl sm:text-7xl">Shop all</h1><p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">Thoughtful pieces for everyday dressing, special plans, and all the moments in between.</p></div>
        <p className="text-sm text-muted-foreground">{total} {total === 1 ? "piece" : "pieces"}</p>
      </div>
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <aside className="w-full md:w-60">
          <p className="text-sm font-medium">Categories</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/shop" className={!category ? "font-medium" : "text-muted-foreground"}>
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop?category=${c.slug}${q ? `&q=${q}` : ""}${availability ? `&availability=${availability}` : ""}${sort ? `&sort=${sort}` : ""}`}
                  className={category === c.slug ? "font-medium" : "text-muted-foreground"}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <p className="text-sm font-medium">Availability</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <Link href="/shop" className={!availability ? "font-medium" : "text-muted-foreground"}>
                All items
              </Link>
              <Link
                href={`/shop?${category ? `category=${category}&` : ""}${q ? `q=${q}&` : ""}availability=in-stock`}
                className={availability === "in-stock" ? "font-medium" : "text-muted-foreground"}
              >
                In stock
              </Link>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium">Sort</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              {[
                { v: "newest", l: "Newest" },
                { v: "price-asc", l: "Price: Low to High" },
                { v: "price-desc", l: "Price: High to Low" },
              ].map((s) => (
                <Link
                  key={s.v}
                  href={`/shop?${category ? `category=${category}&` : ""}${q ? `q=${q}&` : ""}${availability ? `availability=${availability}&` : ""}sort=${s.v}`}
                  className={sort === s.v || (!sort && s.v === "newest") ? "font-medium" : "text-muted-foreground"}
                >
                  {s.l}
                </Link>
              ))}
            </div>
          </div>
        </aside>
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">
                {category || q || availability
                  ? "No products match your filters."
                  : "No products yet — new pieces are being added soon."}
              </p>
              {category || q || availability ? (
                <Link
                  href="/shop"
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/shop?${category ? `category=${category}&` : ""}${q ? `q=${q}&` : ""}${availability ? `availability=${availability}&` : ""}${sort ? `sort=${sort}&` : ""}page=${i + 1}`}
                  className={`inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-[0.8rem] font-medium ${
                    page === i + 1
                      ? "bg-primary text-primary-foreground hover:bg-primary/80"
                      : "border border-border bg-background hover:bg-muted"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
