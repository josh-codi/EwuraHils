"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProduct, updateProduct, deleteProduct } from "@/server/actions/products"
import { attachProductMedia, detachProductMedia } from "@/server/actions/media"
import { MediaUploader } from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

type Variant = {
  id?: string
  sku: string
  size: string
  color: string
  priceOverride: string
  compareAtPriceOverride: string
  stock: number
  lowStockThreshold: number
  active: boolean
}

type Product = Record<string, unknown>

export function ProductEditor({
  product,
  categories,
}: {
  product?: Product
  categories: { id: string; name: string }[]
}) {
  const router = useRouter()
  const p = (product ?? {}) as Record<string, unknown>
  const [name, setName] = useState(String(p.name ?? ""))
  const [slug, setSlug] = useState(String(p.slug ?? ""))
  const [description, setDescription] = useState(String(p.description ?? ""))
  const [sku, setSku] = useState(String(p.sku ?? ""))
  const [price, setPrice] = useState(p.price ? Number(p.price) / 100 : 0)
  const [compareAtPrice, setCompareAtPrice] = useState(p.compareAtPrice ? Number(p.compareAtPrice) / 100 : "")
  const [categoryId, setCategoryId] = useState<string>(String(p.categoryId ?? ""))
  const [published, setPublished] = useState(Boolean(p.published))
  const [featured, setFeatured] = useState(Boolean(p.featured))
  const [newArrival, setNewArrival] = useState(Boolean(p.newArrival))
  const [bestSeller, setBestSeller] = useState(Boolean(p.bestSeller))
  const [seoTitle, setSeoTitle] = useState(String(p.seoTitle ?? ""))
  const [seoDescription, setSeoDescription] = useState(String(p.seoDescription ?? ""))
  const [variants, setVariants] = useState<Variant[]>(
    Array.isArray(product?.variants) && (product.variants as unknown[]).length
      ? (product.variants as Array<Record<string, unknown>>).map((v) => ({
          id: v.id ? String(v.id) : undefined,
          sku: String(v.sku ?? ""),
          size: String(v.size ?? ""),
          color: String(v.color ?? ""),
          priceOverride: v.priceOverride ? String(Number(v.priceOverride) / 100) : "",
          compareAtPriceOverride: v.compareAtPriceOverride ? String(Number(v.compareAtPriceOverride) / 100) : "",
          stock: Number(v.stock ?? 0),
          lowStockThreshold: Number(v.lowStockThreshold ?? 5),
          active: Boolean(v.active ?? true),
        }))
      : [{ sku: "", size: "", color: "", priceOverride: "", compareAtPriceOverride: "", stock: 0, lowStockThreshold: 5, active: true }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateVariant(i: number, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  }
  function addVariant() {
    setVariants((prev) => [...prev, { sku: "", size: "", color: "", priceOverride: "", compareAtPriceOverride: "", stock: 0, lowStockThreshold: 5, active: true }])
  }
  function removeVariant(i: number) {
    setVariants((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)))
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        product: {
          name,
          slug,
          description: description || null,
          sku: sku || null,
          price: Number(price),
          compareAtPrice: compareAtPrice === "" ? null : Number(compareAtPrice),
          categoryId: categoryId || null,
          published,
          featured,
          newArrival,
          bestSeller,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
        },
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku || null,
          size: v.size || null,
          color: v.color || null,
          priceOverride: v.priceOverride === "" ? null : Number(v.priceOverride),
          compareAtPriceOverride: v.compareAtPriceOverride === "" ? null : Number(v.compareAtPriceOverride),
          stock: Number(v.stock),
          lowStockThreshold: Number(v.lowStockThreshold),
          active: v.active,
        })),
      }
      if (p.id) {
        await updateProduct(String(p.id), payload)
        router.refresh()
      } else {
        const created = await createProduct(payload)
        router.push(`/admin/products/${created.id}`)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">{product ? "Edit product" : "New product"}</h1>
        <div className="flex gap-2">
          {p.id ? (
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirm("Delete this product permanently?")) return
                await deleteProduct(String(p.id))
                router.push("/admin/products")
              }}
            >
              Delete
            </Button>
          ) : null}
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">Basic information</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="product-name">Name</Label>
            <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="product-slug">Slug</Label>
            <Input id="product-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="product-sku">SKU</Label>
            <Input id="product-sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">Pricing</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="product-price">Price (GHS)</Label>
            <Input id="product-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <Label>Compare-at price (GHS)</Label>
            <Input
              type="number"
              step="0.01"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">Variants & inventory</h2>
        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="rounded border border-border p-3">
              <div className="grid gap-2 md:grid-cols-4">
                <Input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} />
                <Input placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} />
                <Input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price override"
                  value={v.priceOverride}
                  onChange={(e) => updateVariant(i, { priceOverride: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Compare override"
                  value={v.compareAtPriceOverride}
                  onChange={(e) => updateVariant(i, { compareAtPriceOverride: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Low stock threshold"
                  value={v.lowStockThreshold}
                  onChange={(e) => updateVariant(i, { lowStockThreshold: Number(e.target.value) })}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={v.active}
                    onChange={(e) => updateVariant(i, { active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeVariant(i)}
                disabled={variants.length <= 1}
                className="mt-2"
              >
                Remove variant
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addVariant}>
            Add variant
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">Merchandising</h2>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={published} onCheckedChange={(v) => setPublished(Boolean(v))} />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={featured} onCheckedChange={(v) => setFeatured(Boolean(v))} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={newArrival} onCheckedChange={(v) => setNewArrival(Boolean(v))} />
            New arrival
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={bestSeller} onCheckedChange={(v) => setBestSeller(Boolean(v))} />
            Best seller
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">SEO</h2>
        <div>
          <Label>SEO title</Label>
          <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div>
          <Label>SEO description</Label>
          <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </div>
      </section>

      {p.id ? (
        <section className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-medium">Media</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(p.media as Array<Record<string, unknown>> | undefined)?.map((m) => (
              <div key={String(m.id)} className="relative">
                {(m.mediaAsset as { resourceType?: string } | null)?.resourceType === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={String((m.mediaAsset as { url?: string } | null)?.url)} alt="" className="h-24 w-full rounded object-cover" />
                ) : (
                  <video src={String((m.mediaAsset as { url?: string } | null)?.url)} className="h-24 w-full rounded object-cover" />
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-1 w-full"
                  onClick={async () => {
                    await detachProductMedia(String(m.id))
                    router.refresh()
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <MediaUploader
            folder="products"
            onUploaded={async (asset) => {
              await attachProductMedia(String(p.id), asset.id)
              router.refresh()
            }}
          />
        </section>
      ) : null}
    </div>
  )
}