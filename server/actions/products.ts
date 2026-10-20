"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { productSchema, variantSchema } from "@/lib/validation"
import { z } from "zod"

const productWithVariantsSchema = z.object({
  product: productSchema,
  variants: z.array(variantSchema).default([]),
})

export async function createProduct(input: z.infer<typeof productWithVariantsSchema>) {
  await requireAdmin()
  const data = productWithVariantsSchema.parse(input)
  const p = data.product
  const created = await prisma.product.create({
    data: {
      name: p.name,
      slug: p.slug,
      description: p.description ?? null,
      sku: p.sku ?? null,
      price: Math.round(p.price * 100),
      compareAtPrice: p.compareAtPrice != null ? Math.round(p.compareAtPrice * 100) : null,
      categoryId: p.categoryId ?? null,
      published: p.published,
      publishedAt: p.published ? new Date() : null,
      featured: p.featured,
      newArrival: p.newArrival,
      bestSeller: p.bestSeller,
      seoTitle: p.seoTitle ?? null,
      seoDescription: p.seoDescription ?? null,
      variants: {
        create: data.variants.map((v) => ({
          sku: v.sku ?? null,
          size: v.size ?? null,
          color: v.color ?? null,
          priceOverride: v.priceOverride != null ? Math.round(v.priceOverride * 100) : null,
          compareAtPriceOverride:
            v.compareAtPriceOverride != null ? Math.round(v.compareAtPriceOverride * 100) : null,
          stock: v.stock,
          lowStockThreshold: v.lowStockThreshold,
          active: v.active,
        })),
      },
    },
  })
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/")
  revalidatePath(`/products/${p.slug}`)
  return created
}

export async function updateProduct(
  id: string,
  input: z.infer<typeof productWithVariantsSchema>
) {
  await requireAdmin()
  const data = productWithVariantsSchema.parse(input)
  const p = data.product
  await prisma.$transaction(async (tx) => {
    const current = await tx.product.findUnique({
      where: { id },
      select: { published: true, publishedAt: true },
    })
    if (!current) throw new Error("Product not found")
    await tx.product.update({
      where: { id },
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description ?? null,
        sku: p.sku ?? null,
        price: Math.round(p.price * 100),
        compareAtPrice: p.compareAtPrice != null ? Math.round(p.compareAtPrice * 100) : null,
        categoryId: p.categoryId ?? null,
        published: p.published,
        publishedAt: p.published
          ? current.published
            ? current.publishedAt ?? new Date()
            : new Date()
          : null,
        featured: p.featured,
        newArrival: p.newArrival,
        bestSeller: p.bestSeller,
        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription ?? null,
      },
    })

    // Sync variants
    const existing = await tx.productVariant.findMany({ where: { productId: id } })
    const incomingIds = data.variants.map((v) => v.id).filter(Boolean) as string[]
    // delete removed
    await tx.productVariant.deleteMany({
      where: { productId: id, id: { notIn: incomingIds.length ? incomingIds : ["__none__"] } },
    })
    for (const v of data.variants) {
      const payload = {
        sku: v.sku ?? null,
        size: v.size ?? null,
        color: v.color ?? null,
        priceOverride: v.priceOverride != null ? Math.round(v.priceOverride * 100) : null,
        compareAtPriceOverride:
          v.compareAtPriceOverride != null ? Math.round(v.compareAtPriceOverride * 100) : null,
        stock: v.stock,
        lowStockThreshold: v.lowStockThreshold,
        active: v.active,
      }
      if (v.id && existing.find((e) => e.id === v.id)) {
        await tx.productVariant.update({ where: { id: v.id }, data: payload })
      } else {
        await tx.productVariant.create({ data: { productId: id, ...payload } })
      }
    }
  })
  revalidatePath("/admin/products")
  revalidatePath(`/products/${p.slug}`)
  revalidatePath("/shop")
  revalidatePath("/")
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } })
  await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/")
  if (product) revalidatePath(`/products/${product.slug}`)
}

export async function archiveProduct(id: string) {
  await requireAdmin()
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } })
  await prisma.product.update({
    where: { id },
    data: { published: false, publishedAt: null },
  })
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/")
  if (product) revalidatePath(`/products/${product.slug}`)
}

export async function adjustVariantStock(variantId: string, stock: number) {
  await requireAdmin()
  if (stock < 0) throw new Error("Stock cannot be negative")
  await prisma.productVariant.update({ where: { id: variantId }, data: { stock } })
  revalidatePath("/admin/inventory")
}

export async function toggleProductFlag(
  id: string,
  flag: "featured" | "newArrival" | "bestSeller" | "published",
  value: boolean
) {
  await requireAdmin()
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } })
  const data =
    flag === "published"
      ? { published: value, publishedAt: value ? new Date() : null }
      : { [flag]: value }
  await prisma.product.update({ where: { id }, data })
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/")
  if (product) revalidatePath(`/products/${product.slug}`)
}