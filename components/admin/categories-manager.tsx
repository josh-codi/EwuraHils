"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCategory, updateCategory, deleteCategory } from "@/server/actions/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MediaUploader } from "@/components/admin/media-uploader"
import { toast } from "sonner"

type Category = { id: string; name: string; slug: string; description: string | null; sortOrder: number; coverMediaId?: string | null }

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function reset() {
    setEditing(null)
    setName("")
    setSlug("")
    setDescription("")
    setSortOrder(0)
    setCoverMediaId(null)
  }

  function startEdit(c: Category) {
    setEditing(c)
    setName(c.name)
    setSlug(c.slug)
    setDescription(c.description ?? "")
    setSortOrder(c.sortOrder)
    setCoverMediaId(c.coverMediaId ?? null)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      const payload = { name, slug, description: description || null, parentId: null, sortOrder, coverMediaId }
      if (editing) await updateCategory(editing.id, payload)
      else await createCategory(payload)
      setOpen(false)
      reset()
      toast.success(editing ? "Category updated." : "Category created.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete category?")) return
    try {
      await deleteCategory(id)
      toast.success("Category deleted.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Categories</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
                      <Button onClick={() => { reset(); setOpen(true) }}>New category</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
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
              <div>
                <Label>Cover image</Label>
                <MediaUploader folder="categories" onUploaded={(a) => setCoverMediaId(a.id)} />
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
            <TableHead>Sort</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.slug}</TableCell>
              <TableCell>{c.sortOrder}</TableCell>
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
    </div>
  )
}