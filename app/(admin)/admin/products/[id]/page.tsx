import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProductEditor } from "@/components/admin/product-editor"

export const dynamic = "force-dynamic"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: true, media: { orderBy: { position: "asc" }, include: { mediaAsset: true } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ])
  if (!product) notFound()
  return <ProductEditor product={product} categories={categories} />
}