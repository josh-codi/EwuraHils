"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { bannerSchema } from "@/lib/validation"
import { z } from "zod"

export async function createBanner(input: z.infer<typeof bannerSchema> & {
  mediaAssetId?: string | null
  desktopMediaAssetId?: string | null
  mobileMediaAssetId?: string | null
}) {
  await requireAdmin()
  const data = bannerSchema.parse(input)
  const created = await prisma.banner.create({
    data: {
      internalTitle: data.internalTitle,
      headline: data.headline ?? null,
      subtitle: data.subtitle ?? null,
      ctaLabel: data.ctaLabel ?? null,
      ctaUrl: data.ctaUrl ?? null,
      position: data.position,
      displayOrder: data.displayOrder,
      published: data.published,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      mediaAssetId: input.mediaAssetId ?? null,
      desktopMediaAssetId: input.desktopMediaAssetId ?? null,
      mobileMediaAssetId: input.mobileMediaAssetId ?? null,
    },
  })
  revalidatePath("/admin/banners")
  revalidatePath("/")
  return created
}

export async function updateBanner(
  id: string,
  input: z.infer<typeof bannerSchema> & {
    mediaAssetId?: string | null
    desktopMediaAssetId?: string | null
    mobileMediaAssetId?: string | null
  }
) {
  await requireAdmin()
  const data = bannerSchema.parse(input)
  const updated = await prisma.banner.update({
    where: { id },
    data: {
      internalTitle: data.internalTitle,
      headline: data.headline ?? null,
      subtitle: data.subtitle ?? null,
      ctaLabel: data.ctaLabel ?? null,
      ctaUrl: data.ctaUrl ?? null,
      position: data.position,
      displayOrder: data.displayOrder,
      published: data.published,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      mediaAssetId: input.mediaAssetId ?? null,
      desktopMediaAssetId: input.desktopMediaAssetId ?? null,
      mobileMediaAssetId: input.mobileMediaAssetId ?? null,
    },
  })
  revalidatePath("/admin/banners")
  revalidatePath("/")
  return updated
}

export async function deleteBanner(id: string) {
  await requireAdmin()
  await prisma.banner.delete({ where: { id } })
  revalidatePath("/admin/banners")
  revalidatePath("/")
}

