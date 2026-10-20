"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { categorySchema } from "@/lib/validation"

export async function createCategory(
  input: z.infer<typeof categorySchema> & { coverMediaId?: string | null }
) {
  await requireAdmin()
  const data = categorySchema.parse(input)
  const created = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder,
      coverMediaId: input.coverMediaId ?? null,
    },
  })
  revalidatePath("/admin/categories")
  revalidatePath("/shop")
  return created
}

export async function updateCategory(
  id: string,
  input: z.infer<typeof categorySchema> & { coverMediaId?: string | null }
) {
  await requireAdmin()
  const data = categorySchema.parse(input)
  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder,
      coverMediaId: input.coverMediaId ?? undefined,
    },
  })
  revalidatePath("/admin/categories")
  revalidatePath("/shop")
  return updated
}

export async function deleteCategory(id: string) {
  await requireAdmin()
  await prisma.category.delete({ where: { id } })
  revalidatePath("/admin/categories")
  revalidatePath("/shop")
}