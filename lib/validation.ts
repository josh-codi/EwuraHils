import { z } from "zod"
import { HOMEPAGE_SECTION_TYPES } from "@/lib/homepage-types"

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug")

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema,
  description: z.string().max(10000).optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
})

export const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().max(80).optional().nullable(),
  size: z.string().max(40).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  priceOverride: z.number().min(0).optional().nullable(),
  compareAtPriceOverride: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  active: z.boolean().default(true),
})

export const categorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema,
  description: z.string().max(2000).optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
})

export const collectionSchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema,
  description: z.string().max(5000).optional().nullable(),
  published: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
})

export const bannerSchema = z.object({
  internalTitle: z.string().min(1).max(200),
  headline: z.string().max(200).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  ctaLabel: z.string().max(80).optional().nullable(),
  ctaUrl: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .refine((v) => !v || /^https?:\/\//.test(v), "CTA must be http(s) URL"),
  position: z.string().min(1).max(60).default("hero"),
  displayOrder: z.number().int().default(0),
  published: z.boolean().default(false),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  const start = data.startsAt ? new Date(data.startsAt) : null
  const end = data.endsAt ? new Date(data.endsAt) : null
  if (start && Number.isNaN(start.getTime())) {
    ctx.addIssue({ code: "custom", path: ["startsAt"], message: "Invalid start date" })
  }
  if (end && Number.isNaN(end.getTime())) {
    ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Invalid end date" })
  }
  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start > end) {
    ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End date must be after start date" })
  }
})

export const deliveryZoneSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  fee: z.number().min(0),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const storeSettingsSchema = z.object({
  storeName: z.string().min(1).max(120),
  brandDescription: z.string().max(5000).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  openingHours: z.string().max(1000).optional().nullable(),
  whatsappNumber: z.string().max(40).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  instagram: z.string().url().optional().nullable().or(z.literal("")),
  tiktok: z.string().url().optional().nullable().or(z.literal("")),
  facebook: z.string().url().optional().nullable().or(z.literal("")),
  announcementText: z.string().max(500).optional().nullable(),
  announcementVisible: z.boolean().default(false),
  footerContent: z.string().max(5000).optional().nullable(),
  aboutContent: z.string().max(10000).optional().nullable(),
  shippingPolicy: z.string().max(10000).optional().nullable(),
  returnsPolicy: z.string().max(10000).optional().nullable(),
  customerServiceInfo: z.string().max(5000).optional().nullable(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
})

export const homepageSectionSchema = z.object({
  type: z.enum([...HOMEPAGE_SECTION_TYPES]),
  label: z.string().max(120).optional().nullable(),
  headline: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  visible: z.boolean().default(true),
  position: z.number().int().default(0),
  collectionId: z.string().optional().nullable(),
  bannerId: z.string().optional().nullable(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})