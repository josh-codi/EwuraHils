import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/money"

type ProductCardData = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  featured: boolean
  newArrival: boolean
  media: { mediaAsset: { url: string; altText: string | null; resourceType?: string } | null }[]
  variants?: { stock: number }[]
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = product.media?.[0]?.mediaAsset
  const price = product.price
  const compare = product.compareAtPrice
  const soldOut = product.variants ? product.variants.every((v) => v.stock <= 0) : false
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
          {img ? img.resourceType === "VIDEO" ? (
            <video src={img.url} muted autoPlay loop playsInline className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          ) : (
            <Image
              src={img.url}
              alt={img.altText ?? product.name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {soldOut && <Badge variant="secondary">Sold out</Badge>}
            {product.newArrival && <Badge>New</Badge>}
            {product.featured && <Badge variant="secondary">Featured</Badge>}
            {compare && compare > price && (
              <Badge variant="destructive">Sale</Badge>
            )}
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <h3 className="text-sm font-medium leading-tight tracking-tight">{product.name}</h3>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span>{formatMoney(price)}</span>
            {compare && compare > price && (
              <span className="text-muted-foreground line-through">{formatMoney(compare)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
