import { prisma } from "@/lib/db"
import { CategoriesManager } from "@/components/admin/categories-manager"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
  return <CategoriesManager categories={categories} />
}