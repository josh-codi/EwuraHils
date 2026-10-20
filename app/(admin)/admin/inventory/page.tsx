import { prisma } from "@/lib/db"
import { InventoryManager } from "@/components/admin/inventory-manager"

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
  })
  return <InventoryManager variants={variants} />
}