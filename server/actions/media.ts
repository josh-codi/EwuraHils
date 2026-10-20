"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { destroyCloudinaryAsset, validateUploadMeta } from "@/lib/cloudinary"
import { z } from "zod"

const saveAssetSchema = z.object({
  publicId: z.string(),
  resourceType: z.enum(["IMAGE", "VIDEO"]),
  format: z.string().optional().nullable(),
  url: z.string().url(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  duration: z.number().optional().nullable(),
  altText: z.string().max(500).optional().nullable(),
  posterPublicId: z.string().optional().nullable(),
})

export async function saveMediaAsset(input: z.infer<typeof saveAssetSchema>) {
  await requireAdmin()
  const data = saveAssetSchema.parse(input)
  validateUploadMeta({
    publicId: data.publicId,
    resourceType: data.resourceType.toLowerCase(),
    format: data.format ?? undefined,
    url: data.url,
    width: data.width ?? undefined,
    height: data.height ?? undefined,
    duration: data.duration ?? undefined,
  })
  const asset = await prisma.mediaAsset.upsert({
    where: { publicId: data.publicId },
    update: {
      resourceType: data.resourceType,
      format: data.format ?? null,
      url: data.url,
      width: data.width ?? null,
      height: data.height ?? null,
      duration: data.duration ?? null,
      altText: data.altText ?? null,
      posterPublicId: data.posterPublicId ?? null,
    },
    create: {
      publicId: data.publicId,
      resourceType: data.resourceType,
      format: data.format ?? null,
      url: data.url,
      width: data.width ?? null,
      height: data.height ?? null,
      duration: data.duration ?? null,
      altText: data.altText ?? null,
      posterPublicId: data.posterPublicId ?? null,
    },
  })
  revalidatePath("/admin/media")
  return asset
}

export async function deleteMediaAsset(id: string) {
  await requireAdmin()
  // reference check
  const [pm, cat, col, banner1, banner2, banner3, store1, store2, store3] = await Promise.all([
    prisma.productMedia.count({ where: { mediaAssetId: id } }),
    prisma.category.count({ where: { coverMediaId: id } }),
    prisma.collection.count({ where: { coverMediaId: id } }),
    prisma.banner.count({ where: { mediaAssetId: id } }),
    prisma.banner.count({ where: { desktopMediaAssetId: id } }),
    prisma.banner.count({ where: { mobileMediaAssetId: id } }),
    prisma.storeSettings.count({ where: { logoMediaId: id } }),
    prisma.storeSettings.count({ where: { faviconMediaId: id } }),
    prisma.storeSettings.count({ where: { defaultSocialImageMediaId: id } }),
  ])
  const total =
    pm + cat + col + banner1 + banner2 + banner3 + store1 + store2 + store3
  if (total > 0) {
    throw new Error("Asset is still in use. Remove references first.")
  }
  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw new Error("Asset not found")
  // Remove the remote asset first so the database never references a deleted file.
  // If Cloudinary is not configured, only the metadata record can be removed.
  const deletedRemote = await destroyCloudinaryAsset(asset.publicId, asset.resourceType)
  await prisma.mediaAsset.delete({ where: { id } })
  revalidatePath("/admin/media")
  return { deletedRemote }
}

export async function attachProductMedia(productId: string, mediaAssetId: string) {
  await requireAdmin()
  const maxPos = await prisma.productMedia.aggregate({
    where: { productId },
    _max: { position: true },
  })
  await prisma.productMedia.create({
    data: { productId, mediaAssetId, position: (maxPos._max.position ?? -1) + 1 },
  })
  revalidatePath(`/admin/products`)
  revalidatePath(`/products`)
}

export async function detachProductMedia(productMediaId: string) {
  await requireAdmin()
  await prisma.productMedia.delete({ where: { id: productMediaId } })
  revalidatePath("/admin/products")
}

export async function reorderProductMedia(productId: string, orderedIds: string[]) {
  await requireAdmin()
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.productMedia.update({ where: { id }, data: { position: index } })
    )
  )
  revalidatePath("/admin/products")
}