/**
 * Seeds temporary placeholder media (Pinterest, public https URLs, or local /public assets)
 * so the storefront and admin can be reviewed with realistic content.
 *
 * Usage:
 *   1. Put your URLs in prisma/placeholders.json
 *   2. pnpm db:placeholders
 *
 * The script is idempotent: re-running it updates the same rows.
 * Placeholder assets live under the public id namespace "ewurahils/placeholders/"
 * and are never uploaded to / deleted from Cloudinary.
 */
import "dotenv/config"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const here = dirname(fileURLToPath(import.meta.url))
const configPath = join(here, "placeholders.json")

const PLACEHOLDER_NAMESPACE = "ewurahils/placeholders/"

type PlaceholderEntry = {
  name: string
  type: "image" | "video"
  url: string
}

type BannerEntry = PlaceholderEntry & {
  headline?: string
  subtitle?: string
  ctaLabel?: string
  ctaUrl?: string
}

type PlaceholderConfig = {
  demoProducts?: boolean
  media?: PlaceholderEntry[]
  banners?: BannerEntry[]
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

function usable(entry: { url?: string }): boolean {
  return Boolean(entry?.url && !entry.url.startsWith("REPLACE_ME") && /^(https:\/\/|\/)/.test(entry.url))
}

function readConfig(): PlaceholderConfig {
  const raw = JSON.parse(readFileSync(configPath, "utf-8")) as PlaceholderConfig
  const media = (raw.media ?? []).filter(usable)
  const banners = (raw.banners ?? []).filter(usable)
  if (media.length === 0 && banners.length === 0) {
    throw new Error(
      "No usable placeholder URLs found in prisma/placeholders.json. Add https or local /public media URLs first."
    )
  }
  return { ...raw, media, banners }
}

async function assertReachable(entry: { name: string; url: string }) {
  if (entry.url.startsWith("/")) return true
  try {
    const res = await fetch(entry.url, { method: "HEAD", redirect: "follow" })
    if (!res.ok) {
      console.warn(`  ! ${entry.name}: ${res.status} ${res.statusText} (skipped)`)
      return false
    }
    return true
  } catch (e) {
    console.warn(`  ! ${entry.name}: ${(e as Error).message} (skipped)`)
    return false
  }
}

function formatFromUrl(url: string) {
  const ext = url.split("?")[0].split(".").pop()
  return ext && ext.length <= 5 ? ext.toLowerCase() : null
}

async function upsertAsset(entry: PlaceholderEntry) {
  return prisma.mediaAsset.upsert({
    where: { publicId: `${PLACEHOLDER_NAMESPACE}${entry.name}` },
    update: {
      url: entry.url,
      resourceType: entry.type === "video" ? "VIDEO" : "IMAGE",
      format: formatFromUrl(entry.url),
    },
    create: {
      publicId: `${PLACEHOLDER_NAMESPACE}${entry.name}`,
      url: entry.url,
      resourceType: entry.type === "video" ? "VIDEO" : "IMAGE",
      format: formatFromUrl(entry.url),
    },
  })
}

const DEMO_PRODUCTS = [
  {
    name: "Linen Wrap Dress",
    slug: "placeholder-linen-wrap-dress",
    description:
      "A softly structured linen wrap dress with an easy waist tie, fluid movement, and a warm ivory finish. Designed to move from slow mornings to late dinners.",
    price: 42000,
    compareAtPrice: 52000,
    categorySlug: "clothing",
    variants: [
      { size: "S", color: "Ivory", stock: 6, sku: "PH-DRESS-S" },
      { size: "M", color: "Ivory", stock: 4, sku: "PH-DRESS-M" },
      { size: "L", color: "Ivory", stock: 2, sku: "PH-DRESS-L" },
    ],
  },
  {
    name: "Structured Leather Tote",
    slug: "placeholder-structured-leather-tote",
    description:
      "A clean-lined leather tote with a generous interior and a softly structured silhouette. The everyday carry-all, refined.",
    price: 68000,
    categorySlug: "bags",
    variants: [{ size: "One size", color: "Tan", stock: 5, sku: "PH-TOTE" }],
  },
  {
    name: "Pleated Midi Skirt",
    slug: "placeholder-pleated-midi-skirt",
    description:
      "A fluid pleated midi skirt with an understated sheen and an easy, elegant drape. Pair it with a simple knit or a sharper evening layer.",
    price: 31000,
    compareAtPrice: 38000,
    categorySlug: "clothing",
    variants: [
      { size: "S", color: "Black", stock: 3, sku: "PH-SKIRT-S" },
      { size: "M", color: "Black", stock: 5, sku: "PH-SKIRT-M" },
    ],
  },
  {
    name: "Tailored Wool Blazer",
    slug: "placeholder-tailored-wool-blazer",
    description:
      "A tailored wool blazer cut with a relaxed shoulder and enough structure to sharpen any look. Wear yours open over the everyday edit.",
    price: 85000,
    categorySlug: "clothing",
    variants: [
      { size: "M", color: "Charcoal", stock: 2, sku: "PH-BLAZER-M" },
      { size: "L", color: "Charcoal", stock: 1, sku: "PH-BLAZER-L" },
    ],
  },
  {
    name: "Silk Bias Camisole",
    slug: "placeholder-silk-bias-camisole",
    description:
      "A bias-cut silk camisole with a subtle lustre and a softly curved neckline. A quiet foundation for day or evening dressing.",
    price: 24500,
    categorySlug: "clothing",
    variants: [{ size: "S/M", color: "Sage", stock: 8, sku: "PH-CAMI" }],
  },
  {
    name: "Minimal Leather Loafers",
    slug: "placeholder-leather-loafers",
    description:
      "A minimal leather loafer with a polished finish and a comfortable low profile. The pair that makes everything else feel considered.",
    price: 39500,
    compareAtPrice: 46000,
    categorySlug: "shoes",
    variants: [
      { size: "39", color: "Black", stock: 2, sku: "PH-LOAF-39" },
      { size: "40", color: "Black", stock: 3, sku: "PH-LOAF-40" },
    ],
  },
]

async function ensureCategories() {
  const defaults = [
    { name: "Clothing", slug: "clothing", description: "Fluid tailoring, easy layers, and quietly confident essentials.", sortOrder: 1 },
    { name: "Shoes", slug: "shoes", description: "Polished foundations designed to carry you through the day.", sortOrder: 2 },
    { name: "Bags", slug: "bags", description: "Beautifully useful pieces for the pace of modern life.", sortOrder: 3 },
    { name: "Jewellery", slug: "jewellery", description: "Small details with a lasting point of view.", sortOrder: 4 },
    { name: "Accessories", slug: "accessories", description: "The finishing touches that make an outfit your own.", sortOrder: 5 },
  ]
  const categories = []
  for (const c of defaults) {
    categories.push(
      await prisma.category.upsert({
        where: { slug: c.slug },
        update: { description: c.description },
        create: c,
      })
    )
  }
  return categories
}

async function attachMedia(productId: string, assetIds: string[], startIndex: number) {
  // Drop previously attached placeholder media so re-runs do not accumulate images.
  const existing = await prisma.productMedia.findMany({
    where: { productId },
    include: { mediaAsset: { select: { publicId: true } } },
  })
  const stale = existing.filter((m) => m.mediaAsset.publicId.startsWith(PLACEHOLDER_NAMESPACE))
  if (stale.length) {
    await prisma.productMedia.deleteMany({ where: { id: { in: stale.map((m) => m.id) } } })
  }
  for (let i = 0; i < assetIds.length; i++) {
    const mediaAssetId = assetIds[(startIndex + i) % assetIds.length]
    await prisma.productMedia.upsert({
      where: { productId_mediaAssetId: { productId, mediaAssetId } },
      update: { position: i },
      create: { productId, mediaAssetId, position: i },
    })
  }
}

async function main() {
  const config = readConfig()
  const wanted = [...config.media!, ...config.banners!]

  console.log(`Checking ${wanted.length} placeholder URL(s)…`)
  const reachable: PlaceholderEntry[] = []
  for (const entry of wanted) {
    if (await assertReachable(entry)) reachable.push(entry)
  }
  if (reachable.length === 0) {
    throw new Error("None of the placeholder URLs responded with a 2xx status.")
  }

  console.log("Upserting media assets…")
  const assetByName = new Map<string, string>()
  for (const entry of reachable) {
    if (assetByName.has(entry.name)) continue
    const asset = await upsertAsset(entry)
    assetByName.set(entry.name, asset.id)
    console.log(`  ✓ media ${asset.publicId}`)
  }
  const imageAssets = [...new Set(reachable.filter((e) => e.type === "image").map((e) => assetByName.get(e.name)!))]
  const videoAssets = [...new Set(reachable.filter((e) => e.type === "video").map((e) => assetByName.get(e.name)!))]
  const allAssets = [...assetByName.values()]

  const categories = await ensureCategories()
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))

  if (config.demoProducts) {
    console.log("Seeding placeholder products…")
    for (const [index, demo] of DEMO_PRODUCTS.entries()) {
      const category = categoryBySlug.get(demo.categorySlug)
      const product = await prisma.product.upsert({
        where: { slug: demo.slug },
        update: {
          name: demo.name,
          price: demo.price,
          compareAtPrice: demo.compareAtPrice ?? null,
          categoryId: category?.id ?? null,
          published: true,
          newArrival: index < 3,
          featured: index % 2 === 0,
          bestSeller: index % 3 === 0,
        },
        create: {
          name: demo.name,
          slug: demo.slug,
          description: demo.description,
          price: demo.price,
          compareAtPrice: demo.compareAtPrice ?? null,
          categoryId: category?.id ?? null,
          published: true,
          publishedAt: new Date(),
          newArrival: index < 3,
          featured: index % 2 === 0,
          bestSeller: index % 3 === 0,
        },
      })

      // Sync variants (ids are stable across re-runs).
      for (const variant of demo.variants) {
        await prisma.productVariant.upsert({
          where: { sku: variant.sku },
          update: { stock: variant.stock, productId: product.id },
          create: { ...variant, productId: product.id },
        })
      }

      const mediaIds = imageAssets.length ? imageAssets : allAssets
      // Feature the supplied campaign films on the first two products, then rotate supporting imagery.
      const desired = videoAssets.length && index < 4 ? [videoAssets[index % videoAssets.length]] : []
      desired.push(
        ...Array.from(
          { length: Math.min(3 - desired.length, mediaIds.length) },
          (_, i) => mediaIds[(index + i) % mediaIds.length]
        )
      )
      await attachMedia(product.id, desired, 0)
      console.log(`  ✓ product ${product.slug}`)
    }
  }

  console.log("Curating collections…")
  const collections = await prisma.collection.findMany({ orderBy: { sortOrder: "asc" } })
  const allProducts = await prisma.product.findMany({ orderBy: { createdAt: "asc" } })
  const collectionCopy: Record<string, string> = {
    "new-arrivals": "The latest pieces to shape the season ahead — effortless, considered, and ready to wear.",
    "best-sellers": "The pieces our community reaches for again and again.",
  }
  for (const collection of collections) {
    await prisma.collection.update({
      where: { id: collection.id },
      data: { description: collectionCopy[collection.slug] ?? collection.description },
    })
    const chosen = collection.slug === "new-arrivals"
      ? allProducts.filter((p) => p.newArrival)
      : collection.slug === "best-sellers"
        ? allProducts.filter((p) => p.bestSeller)
        : allProducts
    for (const [position, product] of chosen.entries()) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: collection.id, productId: product.id } },
        update: { position },
        create: { collectionId: collection.id, productId: product.id, position },
      })
    }
  }
  for (const [index, category] of categories.entries()) {
    if (!imageAssets.length) break
    await prisma.category.update({
      where: { id: category.id },
      data: { coverMediaId: imageAssets[index % imageAssets.length] },
    })
  }
  for (const [index, collection] of collections.entries()) {
    if (!imageAssets.length) break
    await prisma.collection.update({
      where: { id: collection.id },
      data: { coverMediaId: imageAssets[index % imageAssets.length] },
    })
  }

  console.log("Creating banners…")
  const bannerEntries = config.banners ?? []
  const createdBanners = []
  for (const [index, entry] of bannerEntries.entries()) {
    // Reuse an existing asset when the banner points at media that is already listed.
    const mediaAssetId =
      assetByName.get(entry.name) ?? (await upsertAsset(entry)).id
    if (!assetByName.has(entry.name)) assetByName.set(entry.name, mediaAssetId)
    const banner = await prisma.banner.upsert({
      where: { id: `placeholder-${entry.name}` },
      update: {
        mediaAssetId,
        headline: entry.headline ?? null,
        subtitle: entry.subtitle ?? null,
        ctaLabel: entry.ctaLabel ?? null,
        ctaUrl: entry.ctaUrl ?? null,
        published: true,
        position: index === 0 ? "hero" : "promotional",
        displayOrder: index,
      },
      create: {
        id: `placeholder-${entry.name}`,
        internalTitle: `Placeholder ${entry.name}`,
        mediaAssetId,
        headline: entry.headline ?? null,
        subtitle: entry.subtitle ?? null,
        ctaLabel: entry.ctaLabel ?? null,
        ctaUrl: entry.ctaUrl ?? null,
        published: true,
        position: index === 0 ? "hero" : "promotional",
        displayOrder: index,
      },
    })
    createdBanners.push(banner)
    console.log(`  ✓ banner ${banner.internalTitle}`)
  }

  if (createdBanners.length) {
    const heroSection = await prisma.homepageSection.findFirst({
      where: { type: "hero" },
      orderBy: { position: "asc" },
    })
    if (heroSection) {
      await prisma.homepageSection.update({
        where: { id: heroSection.id },
        data: { bannerId: createdBanners[0].id },
      })
      console.log("  ✓ hero section linked")
    }

    // Extra banners become promotional sections on the homepage.
    for (const [index, banner] of createdBanners.slice(1).entries()) {
      const section = await prisma.homepageSection.findFirst({
        where: { type: "promotional-banner", bannerId: banner.id },
      })
      if (section) continue
      const maxPosition = await prisma.homepageSection.aggregate({ _max: { position: true } })
      await prisma.homepageSection.create({
        data: {
          type: "promotional-banner",
          label: banner.internalTitle,
          headline: banner.headline,
          description: banner.subtitle,
          visible: true,
          position: (maxPosition._max.position ?? 0) + 1 + index,
          bannerId: banner.id,
        },
      })
      console.log("  ✓ promotional section created")
    }
  }

  console.log("Updating store settings…")
  if (imageAssets.length) {
    await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {
        storeName: "Ewurahils",
        brandDescription: "A considered fashion label for the way you live now — thoughtful pieces, expressive details, and a wardrobe that stays with you.",
        aboutContent: "Ewurahils is a Ghanaian fashion destination built around the beauty of considered choices. We curate modern clothing, accessories, shoes, and bags that feel effortless today and remain relevant long after the season changes.\n\nOur edit is guided by texture, proportion, and the little details that make getting dressed feel personal. From everyday essentials to the piece that changes the whole look, every arrival is chosen with intention.",
        address: "Osu, Accra\nGhana",
        openingHours: "Monday – Saturday: 10:00 – 18:00\nSunday: By appointment",
        whatsappNumber: "233241234567",
        phone: "+233 24 123 4567",
        email: "hello@ewurahils.com",
        announcementText: "Complimentary delivery in Accra on orders over GHS 800",
        announcementVisible: true,
        footerContent: "Thoughtful style, made personal.\nOrders are confirmed personally via WhatsApp.",
        shippingPolicy: "We deliver across Accra and Ghana. Accra orders typically arrive within 1–2 working days; deliveries to other regions take 2–5 working days.\n\nDelivery fees are calculated by zone at checkout. You will receive a WhatsApp confirmation before your order is dispatched.",
        returnsPolicy: "We want you to love your pieces. Returns or exchanges can be requested within 7 days of delivery, provided the item is unworn, unwashed, and returned with its original tags and packaging.\n\nSale items and personalised pieces are final sale. Please contact us on WhatsApp before sending anything back so we can guide you through the process.",
        customerServiceInfo: "Need help choosing a size or styling a piece? Send us a message on WhatsApp and our team will be happy to help. We usually respond during opening hours.",
        seoTitle: "Ewurahils — Considered Fashion",
        seoDescription: "Discover considered clothing, accessories, shoes, and bags from Ewurahils Fashion in Accra, Ghana.",
        defaultSocialImageMediaId: imageAssets[0],
      },
      create: {
        id: "default",
        storeName: "Ewurahils",
        brandDescription: "A considered fashion label for the way you live now — thoughtful pieces, expressive details, and a wardrobe that stays with you.",
        aboutContent: "Ewurahils is a Ghanaian fashion destination built around the beauty of considered choices.",
        defaultSocialImageMediaId: imageAssets[0],
      },
    })
  }

  console.log(`Done. ${reachable.length} placeholder asset(s) ready.`)
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
