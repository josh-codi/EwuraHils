import type { MetadataRoute } from "next"
import { prisma } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const products = await prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
  const categories = await prisma.category.findMany({ select: { slug: true, updatedAt: true } })
  const collections = await prisma.collection.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/shop`, lastModified: new Date() },
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt })),
    ...categories.map((c) => ({ url: `${base}/shop/${c.slug}`, lastModified: c.updatedAt })),
    ...collections.map((c) => ({ url: `${base}/collections/${c.slug}`, lastModified: c.updatedAt })),
  ]
}