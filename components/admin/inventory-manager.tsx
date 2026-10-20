"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adjustVariantStock } from "@/server/actions/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type Variant = {
  id: string
  stock: number
  lowStockThreshold: number
  active: boolean
  sku: string | null
  size: string | null
  color: string | null
  product: { id: string; name: string; slug: string }
}

export function InventoryManager({ variants }: { variants: Variant[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Record<string, number>>({})

  async function save(id: string) {
    const stock = editing[id]
    if (stock === undefined) return
    try {
      await adjustVariantStock(id, stock)
      setEditing((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      toast.success("Stock updated.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl">Inventory</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((v) => {
            const low = v.stock <= v.lowStockThreshold
            return (
              <TableRow key={v.id}>
                <TableCell>{v.product.name}</TableCell>
                <TableCell>{[v.size, v.color].filter(Boolean).join(" / ") || "Default"}</TableCell>
                <TableCell>{v.sku ?? "—"}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-20"
                    value={editing[v.id] ?? v.stock}
                    onChange={(e) => setEditing((prev) => ({ ...prev, [v.id]: Number(e.target.value) }))}
                  />
                </TableCell>
                <TableCell>
                  {v.stock === 0 ? (
                    <Badge variant="destructive">Out of stock</Badge>
                  ) : low ? (
                    <Badge variant="secondary">Low stock</Badge>
                  ) : (
                    <Badge>OK</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => save(v.id)} disabled={editing[v.id] === undefined}>
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}