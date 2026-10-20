import { notFound } from "next/navigation"
import Image from "next/image"
import { getCategoryBySlug } from "@/lib/queries"
import { getPublishedProducts } from "@/lib/queries"
import { ProductCard } from "@/components/products/product-card"

export const revalidate = 60

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = await getCategoryBySlug(category)
  if (!cat) notFound()
  const { items } = await getPublishedProducts({ categorySlug: category, take: 48 })
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-20">
      {cat.coverMedia?.url && (
        <div className="relative mb-8 aspect-[16/6] overflow-hidden rounded-xl bg-muted">
          <Image
            src={cat.coverMedia.url}
            alt={cat.coverMedia.altText ?? cat.name}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}
      <p className="eyebrow">Shop by category</p>
      <h1 className="mt-3 font-heading text-5xl sm:text-7xl">{cat.name}</h1>
      {cat.description && <p className="mt-2 text-muted-foreground">{cat.description}</p>}
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {items.length === 0 && <p className="py-20 text-center text-muted-foreground">No products yet.</p>}
    </div>
  )
}
