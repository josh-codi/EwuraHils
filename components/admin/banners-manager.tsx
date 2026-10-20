"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBanner, updateBanner, deleteBanner } from "@/server/actions/banners"
import { MediaUploader } from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

type Banner = {
  id: string
  internalTitle: string
  headline: string | null
  subtitle: string | null
  ctaLabel: string | null
  ctaUrl: string | null
  position: string
  displayOrder: number
  published: boolean
  startsAt: Date | null
  endsAt: Date | null
  mediaAssetId: string | null
  mediaAsset?: { url: string } | null
}

export function BannersManager({ banners }: { banners: Banner[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [internalTitle, setInternalTitle] = useState("")
  const [headline, setHeadline] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [ctaLabel, setCtaLabel] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
  const [position, setPosition] = useState("hero")
  const [displayOrder, setDisplayOrder] = useState(0)
  const [published, setPublished] = useState(false)
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function reset() {
    setEditing(null)
    setInternalTitle("")
    setHeadline("")
    setSubtitle("")
    setCtaLabel("")
    setCtaUrl("")
    setPosition("hero")
    setDisplayOrder(0)
    setPublished(false)
    setStartsAt("")
    setEndsAt("")
    setMediaAssetId(null)
  }

  function startEdit(b: Banner) {
    setEditing(b)
    setInternalTitle(b.internalTitle)
    setHeadline(b.headline ?? "")
    setSubtitle(b.subtitle ?? "")
    setCtaLabel(b.ctaLabel ?? "")
    setCtaUrl(b.ctaUrl ?? "")
    setPosition(b.position)
    setDisplayOrder(b.displayOrder)
    setPublished(b.published)
    setStartsAt(b.startsAt ? new Date(b.startsAt).toISOString().slice(0, 16) : "")
    setEndsAt(b.endsAt ? new Date(b.endsAt).toISOString().slice(0, 16) : "")
    setMediaAssetId(b.mediaAssetId)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      const payload = {
        internalTitle,
        headline: headline || null,
        subtitle: subtitle || null,
        ctaLabel: ctaLabel || null,
        ctaUrl: ctaUrl || null,
        position,
        displayOrder,
        published,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        mediaAssetId,
      }
      if (editing) await updateBanner(editing.id, payload)
      else await createBanner(payload)
      setOpen(false)
      reset()
      toast.success(editing ? "Banner updated." : "Banner created.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete banner?")) return
    try {
      await deleteBanner(id)
      toast.success("Banner deleted.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Banners</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
          <Button onClick={() => { reset(); setOpen(true) }}>New banner</Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit banner" : "New banner"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Internal title</Label>
                <Input value={internalTitle} onChange={(e) => setInternalTitle(e.target.value)} />
              </div>
              <div>
                <Label>Headline</Label>
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
              <div>
                <Label>CTA label</Label>
                <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
              </div>
              <div>
                <Label>CTA URL</Label>
                <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
              </div>
              <div>
                <Label>Position</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} />
              </div>
              <div>
                <Label>Display order</Label>
                <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
              </div>
              <div>
                <Label>Starts at</Label>
                <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </div>
              <div>
                <Label>Ends at</Label>
                <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                Published
              </label>
            </div>
            <div className="mt-3">
              <MediaUploader
                folder="banners"
                onUploaded={(asset) => setMediaAssetId(asset.id)}
              />
              {mediaAssetId && <p className="mt-2 text-xs text-muted-foreground">Media attached: {mediaAssetId}</p>}
            </div>
            <Button onClick={save} disabled={saving} className="mt-3 w-full">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.internalTitle}</TableCell>
              <TableCell>{b.position}</TableCell>
              <TableCell>
                <Badge variant={b.published ? "default" : "secondary"}>
                  {b.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>{b.displayOrder}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(b)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(b.id)}>
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