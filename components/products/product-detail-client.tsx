"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/money"
import type { Prisma } from "@/lib/generated/prisma/client"
import { ShoppingBag } from "lucide-react"

type Product = Prisma.ProductGetPayload<{
  include: { media: { include: { mediaAsset: true } }; variants: true; category: true }
}>

export function ProductDetailClient({ product }: { product: Product }) {
  const variants = product.variants.filter((v) => v.active)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length === 1 ? variants[0].id : null
  )
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null
  const price = selectedVariant?.priceOverride ?? product.price
  const compare = selectedVariant?.compareAtPriceOverride ?? product.compareAtPrice
  const stock = variants.length === 0 ? 0 : selectedVariant ? selectedVariant.stock : 0
  const canAdd =
    (variants.length === 0 || !!selectedVariant) && stock > 0 && quantity > 0 && quantity <= (stock || 1)

  const addItem = useCartStore((s) => s.addItem)

  function onAdd() {
    if (!canAdd) return
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      quantity,
    })
  }

  const images = product.media.filter((m) => m.mediaAsset?.resourceType === "IMAGE")
  const video = product.media.find((m) => m.mediaAsset?.resourceType === "VIDEO")

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          {images[activeImage]?.mediaAsset?.url ? (
            <Image
              src={images[activeImage].mediaAsset!.url}
              alt={images[activeImage].mediaAsset?.altText ?? product.name}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-12 shrink-0 overflow-hidden rounded border ${i === activeImage ? "border-primary" : "border-border"}`}
              >
                {m.mediaAsset?.url && (
                  <Image src={m.mediaAsset.url} alt="" fill className="object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
        {video?.mediaAsset?.url && (
          <div className="mt-4">
            <video src={video.mediaAsset.url} controls className="w-full rounded-lg" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">{product.category?.name}</p>
          <h1 className="font-heading text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xl">{formatMoney(price)}</span>
            {compare && compare > price && (
              <span className="text-muted-foreground line-through">{formatMoney(compare)}</span>
            )}
          </div>
        </div>

        {product.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        )}

        {variants.length > 0 && (
          <div>
            <p className="text-sm font-medium">Variant</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((v) => {
                const label = [v.size, v.color].filter(Boolean).join(" / ") || v.sku || "Default"
                const active = selectedVariantId === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    } ${v.stock <= 0 ? "opacity-40" : ""}`}
                    disabled={v.stock <= 0}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {selectedVariant && (
              <p className="mt-2 text-xs text-muted-foreground">
                SKU: {selectedVariant.sku ?? "—"} · Stock: {selectedVariant.stock}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-medium">Quantity</p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </Button>
            <span className="w-10 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.min(stock || 99, 99, q + 1))}
            >
              +
            </Button>
          </div>
          {stock > 0 && stock < 6 && selectedVariant && (
            <p className="mt-1 text-xs text-destructive">Only {stock} left</p>
          )}
          {variants.length > 0 && !selectedVariant && (
            <p className="mt-1 text-xs text-muted-foreground">
              Select a size and colour to continue.
            </p>
          )}
          {selectedVariant && stock === 0 && (
            <p className="mt-1 text-xs text-destructive">Out of stock</p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onAdd} disabled={!canAdd} className="flex-1" size="lg">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to bag
          </Button>
          <Link href="/contact" className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted">
            Enquire
          </Link>
        </div>
      </div>
    </div>
  )
}