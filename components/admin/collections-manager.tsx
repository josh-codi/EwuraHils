"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCollection, updateCollection, deleteCollection, setCollectionProducts } from "@/server/actions/collections"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MediaUploader } from "@/components/admin/media-uploader"
import { toast } from "sonner"

type Collection = {
  id: string
  name: string
  slug: string
  description: string | null
  published: boolean
  sortOrder: number
  coverMediaId?: string | null
  products?: { productId: string }[]
}
type Product = { id: string; name: string }

export function CollectionsManager({ collections, products }: { collections: Collection[]; products: Product[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [published, setPublished] = useState(false)
  const [sortOrder, setSortOrder] = useState(0)
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [targetCollectionId, setTargetCollectionId] = useState<string>("")
  const [saving, setSaving] = useState(false)

  function reset() {
    setEditing(null)
    setName("")
    setSlug("")
    setDescription("")
    setPublished(false)
    setSortOrder(0)
    setCoverMediaId(null)
    setSelectedProducts([])
  }

  function startEdit(c: Collection) {
    setEditing(c)
    setName(c.name)
    setSlug(c.slug)
    setDescription(c.description ?? "")
    setPublished(c.published)
    setSortOrder(c.sortOrder)
    setCoverMediaId(c.coverMediaId ?? null)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      const payload = { name, slug, description: description || null, published, sortOrder, coverMediaId }
      if (editing) await updateCollection(editing.id, payload)
      else await createCollection(payload)
      setOpen(false)
      reset()
      toast.success(editing ? "Collection updated." : "Collection created.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete collection?")) return
    try {
      await deleteCollection(id)
      toast.success("Collection deleted.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function saveProducts(collectionId: string) {
    try {
      await setCollectionProducts(collectionId, selectedProducts)
      toast.success("Collection products saved.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Collections</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
          <Button onClick={() => { reset(); setOpen(true) }}>New collection</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit collection" : "New collection"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                Published
              </label>
              <div>
                <Label>Cover image</Label>
                <MediaUploader folder="collections" onUploaded={(a) => setCoverMediaId(a.id)} />
                {coverMediaId && <p className="text-xs text-muted-foreground">Cover set</p>}
              </div>
              <Button onClick={save} disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.slug}</TableCell>
              <TableCell>{c.published ? "Published" : "Draft"}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="rounded-lg border border-border p-4">
        <h2 className="font-medium">Assign products to a collection</h2>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <select
            className="rounded border border-border bg-background px-3 py-2 text-sm"
            value={targetCollectionId}
            onChange={(e) => {
              const id = e.target.value
              setTargetCollectionId(id)
              const col = collections.find((c) => c.id === id)
              setSelectedProducts(col?.products?.map((p) => p.productId) ?? [])
            }}
          >
            <option value="">Select collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!targetCollectionId}
            onClick={() => saveProducts(targetCollectionId)}
          >
            Save product order
          </Button>
        </div>
        <div className="mt-3 grid max-h-60 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedProducts.includes(p.id)}
                onChange={(e) => {
                  setSelectedProducts((prev) =>
                    e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id)
                  )
                }}
              />
              {p.name}
            </label>
          ))}
        </div>

      </div>
    </div>
  )
}