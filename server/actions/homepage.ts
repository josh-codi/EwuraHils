"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { homepageSectionSchema } from "@/lib/validation"
import { z } from "zod"

export async function createHomepageSection(input: z.infer<typeof homepageSectionSchema>) {
  await requireAdmin()
  const data = homepageSectionSchema.parse(input)
  const created = await prisma.homepageSection.create({
    data: {
      type: data.type,
      label: data.label ?? null,
      headline: data.headline ?? null,
      description: data.description ?? null,
      visible: data.visible,
      position: data.position,
      collectionId: data.collectionId ?? null,
      bannerId: data.bannerId ?? null,
    },
  })
  revalidatePath("/admin/homepage")
  revalidatePath("/")
  return created
}

export async function updateHomepageSection(id: string, input: z.infer<typeof homepageSectionSchema>) {
  await requireAdmin()
  const data = homepageSectionSchema.parse(input)
  const updated = await prisma.homepageSection.update({
    where: { id },
    data: {
      type: data.type,
      label: data.label ?? null,
      headline: data.headline ?? null,
      description: data.description ?? null,
      visible: data.visible,
      position: data.position,
      collectionId: data.collectionId ?? null,
      bannerId: data.bannerId ?? null,
    },
  })
  revalidatePath("/admin/homepage")
  revalidatePath("/")
  return updated
}

export async function deleteHomepageSection(id: string) {
  await requireAdmin()
  await prisma.homepageSection.delete({ where: { id } })
  revalidatePath("/admin/homepage")
  revalidatePath("/")
}

export async function reorderHomepageSections(orderedIds: string[]) {
  await requireAdmin()
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.homepageSection.update({ where: { id }, data: { position: index + 1 } })
    )
  )
  revalidatePath("/admin/homepage")
  revalidatePath("/")
}