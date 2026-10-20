"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createHomepageSection, updateHomepageSection, deleteHomepageSection, reorderHomepageSections } from "@/server/actions/homepage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  HOMEPAGE_SECTION_LABELS,
  HOMEPAGE_SECTION_TYPES,
  type HomepageSectionType,
} from "@/lib/homepage-types"

type Section = {
  id: string
  type: HomepageSectionType
  label: string | null
  headline: string | null
  description: string | null
  visible: boolean
  position: number
  collectionId: string | null
  bannerId: string | null
}

export function HomepageManager({
  sections,
  collections,
  banners,
}: {
  sections: Section[]
  collections: { id: string; name: string }[]
  banners: { id: string; internalTitle: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Section | null>(null)
  const [type, setType] = useState<HomepageSectionType>("hero")
  const [label, setLabel] = useState("")
  const [headline, setHeadline] = useState("")
  const [description, setDescription] = useState("")
  const [visible, setVisible] = useState(true)
  const [position, setPosition] = useState(0)
  const [collectionId, setCollectionId] = useState("")
  const [bannerId, setBannerId] = useState("")
  const [saving, setSaving] = useState(false)

  function reset() {
    setEditing(null)
    setType("hero")
    setLabel("")
    setHeadline("")
    setDescription("")
    setVisible(true)
    setPosition(sections.length + 1)
    setCollectionId("")
    setBannerId("")
  }

  function startEdit(s: Section) {
    setEditing(s)
    setType(s.type)
    setLabel(s.label ?? "")
    setHeadline(s.headline ?? "")
    setDescription(s.description ?? "")
    setVisible(s.visible)
    setPosition(s.position)
    setCollectionId(s.collectionId ?? "")
    setBannerId(s.bannerId ?? "")
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      const payload = {
        type,
        label: label || null,
        headline: headline || null,
        description: description || null,
        visible,
        position,
        collectionId: collectionId || null,
        bannerId: bannerId || null,
      }
      if (editing) await updateHomepageSection(editing.id, payload)
      else await createHomepageSection(payload)
      setOpen(false)
      reset()
      toast.success(editing ? "Section updated." : "Section created.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete section?")) return
    try {
      await deleteHomepageSection(id)
      toast.success("Section deleted.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const ordered = [...sections].sort((a, b) => a.position - b.position)
    const idx = ordered.findIndex((s) => s.id === id)
    const target = idx + dir
    if (target < 0 || target >= ordered.length) return
    const swapped = [...ordered]
    ;[swapped[idx], swapped[target]] = [swapped[target], swapped[idx]]
    try {
      await reorderHomepageSections(swapped.map((s) => s.id))
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Homepage</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
          <Button onClick={() => { reset(); setOpen(true) }}>New section</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit section" : "New section"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType((v ?? "hero") as HomepageSectionType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section type" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOMEPAGE_SECTION_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {HOMEPAGE_SECTION_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
              <div>
                <Label>Headline</Label>
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Position</Label>
                <Input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} />
              </div>
              <div>
                <Label>Collection</Label>
                <Select value={collectionId || "none"} onValueChange={(v) => setCollectionId(v === "none" ? "" : (v ?? ""))}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Banner</Label>
                <Select value={bannerId || "none"} onValueChange={(v) => setBannerId(v === "none" ? "" : (v ?? ""))}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {banners.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.internalTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
                Visible
              </label>
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
            <TableHead>Order</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...sections].sort((a, b) => a.position - b.position).map((s) => (
            <TableRow key={s.id}>
              <TableCell className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => move(s.id, -1)}>
                  ↑
                </Button>
                <Button size="sm" variant="ghost" onClick={() => move(s.id, 1)}>
                  ↓
                </Button>
              </TableCell>
              <TableCell>{s.type}</TableCell>
              <TableCell>{s.label ?? "—"}</TableCell>
              <TableCell>{s.visible ? "Yes" : "No"}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
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