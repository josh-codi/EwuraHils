"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/lib/cart-store"
import { getCartProducts, fetchDeliveryZones, prepareWhatsAppOrder } from "@/server/actions/cart"
import { formatMoney } from "@/lib/money"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag } from "lucide-react"

type Product = Awaited<ReturnType<typeof getCartProducts>>[number]

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const deliveryZoneId = useCartStore((s) => s.deliveryZoneId)
  const setDeliveryZone = useCartStore((s) => s.setDeliveryZone)
  const clear = useCartStore((s) => s.clear)

  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [zones, setZones] = useState<Awaited<ReturnType<typeof fetchDeliveryZones>>>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const ids = Array.from(new Set(items.map((i) => i.productId)))
    getCartProducts(ids).then(setProducts)
    fetchDeliveryZones().then(setZones)
  }, [mounted, items])

  if (!mounted) return null

  const productMap = new Map(products.map((p) => [p.id, p]))

  type EnrichedItem = {
    item: (typeof items)[number]
    product: Product
    variant: Product["variants"][number] | null | undefined
    price: number
    line: number
    maxStock: number
  }

  const enriched = items
    .map((item): EnrichedItem | null => {
      const product = productMap.get(item.productId)
      if (!product) return null
      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null
      const price = variant?.priceOverride ?? product.price
      return {
        item,
        product,
        variant,
        price,
        line: price * item.quantity,
        maxStock: variant?.stock ?? 0,
      }
    })
    .filter((e): e is EnrichedItem => e !== null)

  const subtotal = enriched.reduce((s, e) => s + e.line, 0)
  const unavailable = items.filter((i) => !productMap.has(i.productId))

  async function handleWhatsApp() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await prepareWhatsAppOrder({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        deliveryZoneId,
      })
      if (!res.ok) {
        setError(
          res.warnings?.length ? res.warnings.join(" ") : (res.error ?? "Unable to prepare order")
        )
        return
      }
      if (res.warnings?.length) setError(res.warnings.join(" "))
      setResult(res)
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank", "noopener,noreferrer")
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-heading text-2xl">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">Discover something you love.</p>
        <Link href="/shop" className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl">Your Bag</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {enriched.map((e) => (
            <div key={`${e.item.productId}-${e.item.variantId}`} className="flex gap-4 border-b border-border pb-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-muted">
                {e.product.media?.find((m) => m.mediaAsset?.resourceType === "IMAGE")?.mediaAsset?.url && (
                  <Image src={e.product.media.find((m) => m.mediaAsset?.resourceType === "IMAGE")!.mediaAsset!.url} alt={e.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/products/${e.product.slug}`} className="font-medium">
                  {e.product.name}
                </Link>
                {e.variant && (
                  <p className="text-xs text-muted-foreground">
                    {[e.variant.size, e.variant.color].filter(Boolean).join(" / ")}
                  </p>
                )}
                <p className="mt-1 text-sm">{formatMoney(e.price)}</p>
                {e.maxStock <= 0 ? (
                  <p className="mt-1 text-xs text-destructive">Out of stock — remove to continue</p>
                ) : e.item.quantity >= e.maxStock ? (
                  <p className="mt-1 text-xs text-destructive">Only {e.maxStock} available</p>
                ) : null}
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(e.item.productId, e.item.variantId, e.item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm">{e.item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={e.item.quantity >= e.maxStock || e.item.quantity >= 99}
                    onClick={() =>
                      updateQuantity(
                        e.item.productId,
                        e.item.variantId,
                        Math.min(e.item.quantity + 1, e.maxStock, 99)
                      )
                    }
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(e.item.productId, e.item.variantId)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="text-sm font-medium">{formatMoney(e.line)}</div>
            </div>
          ))}
          {unavailable.map((i) => (
            <div
              key={`${i.productId}-${i.variantId}`}
              className="flex items-center justify-between gap-4 border-b border-border pb-4 text-sm"
            >
              <span className="text-destructive">
                An item in your bag is no longer available and will not be ordered.
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(i.productId, i.variantId)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="font-heading text-xl">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div>
            <p className="text-sm font-medium">Delivery area</p>
            <Select
              value={deliveryZoneId ?? ""}
              onValueChange={(v) => setDeliveryZone(v || null)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select delivery area" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name} — {formatMoney(z.fee)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {deliveryZoneId && (
            <div className="flex justify-between text-sm">
              <span>Delivery fee</span>
              <span>
                {formatMoney(zones.find((z) => z.id === deliveryZoneId)?.fee ?? 0)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between border-t border-border pt-3 font-medium">
            <span>Estimated total</span>
            <span>
              {formatMoney(
                subtotal + (zones.find((z) => z.id === deliveryZoneId)?.fee ?? 0)
              )}
            </span>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {Array.isArray(result?.warnings) && result.warnings.length > 0 && (
            <p className="text-xs text-muted-foreground">{(result.warnings as string[]).join(" ")}</p>
          )}
          {typeof result?.whatsappUrl === "string" && (
            <a
              href={result.whatsappUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium underline"
            >
              Open WhatsApp message
            </a>
          )}
          <Button onClick={handleWhatsApp} disabled={loading} className="w-full" size="lg">
            {loading ? "Preparing…" : "Order via WhatsApp"}
          </Button>
          <p className="text-xs text-muted-foreground">
            You will be redirected to WhatsApp to send the order message. The seller will confirm
            availability and final total. If the WhatsApp window does not open, use the link
            above.
          </p>
          <Button variant="ghost" size="sm" onClick={() => clear()} className="w-full">
            Clear bag
          </Button>
        </div>
      </div>
    </div>
  )
}
