import { prisma } from "@/lib/db"
import { CollectionsManager } from "@/components/admin/collections-manager"

export const dynamic = "force-dynamic"

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      include: { products: { orderBy: { position: "asc" }, select: { productId: true } } },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ])
  return <CollectionsManager collections={collections} products={products} />
}