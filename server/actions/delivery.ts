"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { deliveryZoneSchema } from "@/lib/validation"
import { z } from "zod"

export async function createDeliveryZone(input: z.infer<typeof deliveryZoneSchema>) {
  await requireAdmin()
  const data = deliveryZoneSchema.parse(input)
  const created = await prisma.deliveryZone.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      fee: Math.round(data.fee * 100),
      active: data.active,
      sortOrder: data.sortOrder,
    },
  })
  revalidatePath("/admin/delivery")
  revalidatePath("/cart")
  return created
}

export async function updateDeliveryZone(id: string, input: z.infer<typeof deliveryZoneSchema>) {
  await requireAdmin()
  const data = deliveryZoneSchema.parse(input)
  const updated = await prisma.deliveryZone.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? null,
      fee: Math.round(data.fee * 100),
      active: data.active,
      sortOrder: data.sortOrder,
    },
  })
  revalidatePath("/admin/delivery")
  revalidatePath("/cart")
  return updated
}

export async function deleteDeliveryZone(id: string) {
  await requireAdmin()
  await prisma.deliveryZone.delete({ where: { id } })
  revalidatePath("/admin/delivery")
  revalidatePath("/cart")
}

export async function reorderDeliveryZones(orderedIds: string[]) {
  await requireAdmin()
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.deliveryZone.update({ where: { id }, data: { sortOrder: index } })
    )
  )
  revalidatePath("/admin/delivery")
}