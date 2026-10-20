import { prisma } from "@/lib/db"
import { ProductEditor } from "@/components/admin/product-editor"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
  return <ProductEditor categories={categories} />
}