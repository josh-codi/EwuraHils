import { notFound } from "next/navigation"
import { cache } from "react"
import { getPublishedProductOr404, getRelatedProducts } from "@/lib/queries"
import { ProductDetailClient } from "@/components/products/product-detail-client"
import { ProductCard } from "@/components/products/product-card"

export const revalidate = 60

const getProduct = cache((slug: string) => getPublishedProductOr404(slug))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.description ?? undefined,
    openGraph: {
      title: product.seoTitle ?? product.name,
      description: product.seoDescription ?? product.description ?? undefined,
      type: "website",
      images: product.media?.[0]?.mediaAsset?.url
        ? [product.media[0].mediaAsset.url]
        : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  const related = await getRelatedProducts(product.id, product.categoryId)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.media?.[0]?.mediaAsset?.url,
    sku: product.sku ?? undefined,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "GHS",
      availability: product.variants?.some((v: { stock?: number }) => (v.stock ?? 0) > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient product={product} />
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-2xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
