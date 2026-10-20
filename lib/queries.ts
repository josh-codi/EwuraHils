import { prisma } from "@/lib/db"

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { coverMedia: true } })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug }, include: { coverMedia: true } })
}

export async function getPublishedProducts(opts?: {
  categorySlug?: string
  search?: string
  sort?: string
  take?: number
  skip?: number
  featured?: boolean
  newArrival?: boolean
  bestSeller?: boolean
  collectionSlug?: string
  inStock?: boolean
}) {
  const where: Record<string, unknown> = { published: true }
  if (opts?.categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: opts.categorySlug } })
    where.categoryId = cat?.id ?? "__missing__"
  }
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { description: { contains: opts.search, mode: "insensitive" } },
    ]
  }
  if (opts?.featured) where.featured = true
  if (opts?.newArrival) where.newArrival = true
  if (opts?.bestSeller) where.bestSeller = true
  if (opts?.collectionSlug) {
    where.collections = { some: { collection: { slug: opts.collectionSlug, published: true } } }
  }
  if (opts?.inStock) {
    where.variants = { some: { active: true, stock: { gt: 0 } } }
  }

  let orderBy: Record<string, unknown> = { createdAt: "desc" }
  if (opts?.sort === "price-asc") orderBy = { price: "asc" }
  if (opts?.sort === "price-desc") orderBy = { price: "desc" }
  if (opts?.sort === "name") orderBy = { name: "asc" }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: opts?.take ?? 24,
      skip: opts?.skip ?? 0,
      include: {
        category: true,
        media: { orderBy: { position: "asc" }, take: 1, include: { mediaAsset: true } },
        variants: { where: { active: true } },
      },
    }),
    prisma.product.count({ where }),
  ])
  return { items, total }
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      media: { orderBy: { position: "asc" }, include: { mediaAsset: true } },
      variants: { orderBy: { createdAt: "asc" } },
      collections: { include: { collection: true } },
    },
  })
}

export async function getPublishedProductOr404(slug: string) {
  const p = await getProductBySlug(slug)
  if (!p || !p.published) return null
  return p
}

export async function getCollections(publishedOnly = true) {
  return prisma.collection.findMany({
    where: publishedOnly ? { published: true } : undefined,
    orderBy: { sortOrder: "asc" },
    include: { coverMedia: true, _count: { select: { products: true } } },
  })
}

export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({
    where: { slug },
    include: {
      coverMedia: true,
      products: {
        orderBy: { position: "asc" },
        include: { product: { include: { media: { orderBy: { position: "asc" }, take: 1, include: { mediaAsset: true } }, variants: { where: { active: true } } } } },
      },
    },
  })
}

export async function getActiveBanners(position?: string) {
  const now = new Date()
  return prisma.banner.findMany({
    where: {
      published: true,
      position: position ?? undefined,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { displayOrder: "asc" },
    include: { mediaAsset: true, desktopMediaAsset: true, mobileMediaAsset: true },
  })
}

export async function getHomepageSections() {
  return prisma.homepageSection.findMany({
    where: { visible: true },
    orderBy: { position: "asc" },
    include: {
      collection: {
        include: {
          coverMedia: true,
          products: {
            orderBy: { position: "asc" },
            take: 8,
            include: {
              product: {
                include: {
                  media: { orderBy: { position: "asc" }, take: 1, include: { mediaAsset: true } },
                  variants: { where: { active: true } },
                },
              },
            },
          },
        },
      },
      banner: { include: { mediaAsset: true, desktopMediaAsset: true, mobileMediaAsset: true } },
    },
  })
}

export async function getDeliveryZones(activeOnly = true) {
  return prisma.deliveryZone.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { sortOrder: "asc" },
  })
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  return prisma.product.findMany({
    where: { published: true, id: { not: productId }, categoryId: categoryId ?? undefined },
    take: limit,
    include: {
      media: { orderBy: { position: "asc" }, take: 1, include: { mediaAsset: true } },
      variants: { where: { active: true } },
    },
  })
}