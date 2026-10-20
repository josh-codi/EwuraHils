"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { collectionSchema } from "@/lib/validation"

export async function createCollection(
  input: z.infer<typeof collectionSchema> & { coverMediaId?: string | null }
) {
  await requireAdmin()
  const data = collectionSchema.parse(input)
  const created = await prisma.collection.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      published: data.published,
      sortOrder: data.sortOrder,
      coverMediaId: input.coverMediaId ?? null,
    },
  })
  revalidatePath("/admin/collections")
  return created
}

export async function updateCollection(
  id: string,
  input: z.infer<typeof collectionSchema> & { coverMediaId?: string | null }
) {
  await requireAdmin()
  const data = collectionSchema.parse(input)
  const updated = await prisma.collection.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      published: data.published,
      sortOrder: data.sortOrder,
      coverMediaId: input.coverMediaId ?? undefined,
    },
  })
  revalidatePath("/admin/collections")
  revalidatePath(`/collections/${updated.slug}`)
  return updated
}

export async function deleteCollection(id: string) {
  await requireAdmin()
  await prisma.collection.delete({ where: { id } })
  revalidatePath("/admin/collections")
}

export async function setCollectionProducts(collectionId: string, productIds: string[]) {
  await requireAdmin()
  await prisma.$transaction(async (tx) => {
    await tx.collectionProduct.deleteMany({ where: { collectionId } })
    if (productIds.length) {
      await tx.collectionProduct.createMany({
        data: productIds.map((productId, index) => ({
          collectionId,
          productId,
          position: index,
        })),
      })
    }
  })
  revalidatePath("/admin/collections")
  revalidatePath("/collections")
  revalidatePath("/")
}