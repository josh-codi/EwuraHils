import { notFound } from "next/navigation"
import Image from "next/image"
import { getCollectionBySlug } from "@/lib/queries"
import { ProductCard } from "@/components/products/product-card"

export const revalidate = 60

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection || !collection.published) notFound()
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-20">
      {collection.coverMedia?.url && (
        <div className="relative mb-8 aspect-[16/6] overflow-hidden rounded-xl bg-muted">
          <Image
            src={collection.coverMedia.url}
            alt={collection.coverMedia.altText ?? collection.name}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}
      <p className="eyebrow">Curated collection</p>
      <h1 className="mt-3 font-heading text-5xl sm:text-7xl">{collection.name}</h1>
      {collection.description && <p className="mt-2 text-muted-foreground">{collection.description}</p>}
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
        {collection.products.map((cp) => (
          <ProductCard key={cp.product.id} product={cp.product} />
        ))}
      </div>
      {collection.products.length === 0 && <p className="py-20 text-center text-muted-foreground">No products yet.</p>}
    </div>
  )
}
