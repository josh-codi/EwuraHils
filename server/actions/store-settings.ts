"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { storeSettingsSchema } from "@/lib/validation"
import { z } from "zod"

export async function updateStoreSettings(
  input: z.infer<typeof storeSettingsSchema> & {
    logoMediaId?: string | null
    faviconMediaId?: string | null
    defaultSocialImageMediaId?: string | null
  }
) {
  await requireAdmin()
  const data = storeSettingsSchema.parse(input)
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {
      storeName: data.storeName,
      brandDescription: data.brandDescription ?? null,
      address: data.address ?? null,
      openingHours: data.openingHours ?? null,
      whatsappNumber: data.whatsappNumber ?? null,
      phone: data.phone ?? null,
      email: data.email || null,
      instagram: data.instagram || null,
      tiktok: data.tiktok || null,
      facebook: data.facebook || null,
      announcementText: data.announcementText ?? null,
      announcementVisible: data.announcementVisible,
      footerContent: data.footerContent ?? null,
      aboutContent: data.aboutContent ?? null,
      shippingPolicy: data.shippingPolicy ?? null,
      returnsPolicy: data.returnsPolicy ?? null,
      customerServiceInfo: data.customerServiceInfo ?? null,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      logoMediaId: input.logoMediaId ?? undefined,
      faviconMediaId: input.faviconMediaId ?? undefined,
      defaultSocialImageMediaId: input.defaultSocialImageMediaId ?? undefined,
    },
    create: {
      id: "default",
      storeName: data.storeName,
      brandDescription: data.brandDescription ?? null,
      address: data.address ?? null,
      openingHours: data.openingHours ?? null,
      whatsappNumber: data.whatsappNumber ?? null,
      phone: data.phone ?? null,
      email: data.email || null,
      instagram: data.instagram || null,
      tiktok: data.tiktok || null,
      facebook: data.facebook || null,
      announcementText: data.announcementText ?? null,
      announcementVisible: data.announcementVisible,
      footerContent: data.footerContent ?? null,
      aboutContent: data.aboutContent ?? null,
      shippingPolicy: data.shippingPolicy ?? null,
      returnsPolicy: data.returnsPolicy ?? null,
      customerServiceInfo: data.customerServiceInfo ?? null,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      logoMediaId: input.logoMediaId ?? null,
      faviconMediaId: input.faviconMediaId ?? null,
      defaultSocialImageMediaId: input.defaultSocialImageMediaId ?? null,
    },
  })
  revalidatePath("/")
  revalidatePath("/admin/settings")
  revalidatePath("/about")
  revalidatePath("/contact")
}