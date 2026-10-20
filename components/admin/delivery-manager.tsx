"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDeliveryZone, updateDeliveryZone, deleteDeliveryZone, reorderDeliveryZones } from "@/server/actions/delivery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

type Zone = { id: string; name: string; description: string | null; fee: number; active: boolean; sortOrder: number }

export function DeliveryManager({ zones }: { zones: Zone[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Zone | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [fee, setFee] = useState(0)
  const [active, setActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)

  function reset() {
    setEditing(null)
    setName("")
    setDescription("")
    setFee(0)
    setActive(true)
    setSortOrder(0)
  }

  function startEdit(z: Zone) {
    setEditing(z)
    setName(z.name)
    setDescription(z.description ?? "")
    setFee(z.fee / 100)
    setActive(z.active)
    setSortOrder(z.sortOrder)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      const payload = { name, description: description || null, fee: Number(fee), active, sortOrder }
      if (editing) await updateDeliveryZone(editing.id, payload)
      else await createDeliveryZone(payload)
      setOpen(false)
      reset()
      toast.success(editing ? "Delivery zone updated." : "Delivery zone created.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete zone?")) return
    try {
      await deleteDeliveryZone(id)
      toast.success("Delivery zone deleted.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const ordered = [...zones].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = ordered.findIndex((z) => z.id === id)
    const target = idx + dir
    if (target < 0 || target >= ordered.length) return
    const swapped = [...ordered]
    ;[swapped[idx], swapped[target]] = [swapped[target], swapped[idx]]
    try {
      await reorderDeliveryZones(swapped.map((z) => z.id))
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Delivery zones</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
          <Button onClick={() => { reset(); setOpen(true) }}>New zone</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit zone" : "New zone"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Fee (GHS)</Label>
                <Input type="number" step="0.01" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Active
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
            <TableHead>Name</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Active</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zones.map((z) => (
            <TableRow key={z.id}>
              <TableCell>{z.name}</TableCell>
              <TableCell>{(z.fee / 100).toFixed(2)} GHS</TableCell>
              <TableCell>{z.active ? "Yes" : "No"}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => move(z.id, -1)}>
                  ↑
                </Button>
                <Button size="sm" variant="ghost" onClick={() => move(z.id, 1)}>
                  ↓
                </Button>
                <Button size="sm" variant="outline" onClick={() => startEdit(z)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(z.id)}>
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