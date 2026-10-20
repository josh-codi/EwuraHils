import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123"
  const adminName = process.env.ADMIN_NAME ?? "Store Admin"

  const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.adminUser.create({
      data: { email: adminEmail, name: adminName, passwordHash, role: "ADMIN" },
    })
    console.log(`Created admin user: ${adminEmail}`)
  } else {
    console.log(`Admin user already exists: ${adminEmail}`)
  }

  // Categories
  const categories = [
    { name: "Clothing", slug: "clothing", sortOrder: 1 },
    { name: "Shoes", slug: "shoes", sortOrder: 2 },
    { name: "Bags", slug: "bags", sortOrder: 3 },
    { name: "Jewellery", slug: "jewellery", sortOrder: 4 },
    { name: "Accessories", slug: "accessories", sortOrder: 5 },
  ]
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    })
  }

  // Collections
  for (const c of [
    { name: "New Arrivals", slug: "new-arrivals", published: true, sortOrder: 1 },
    { name: "Best Sellers", slug: "best-sellers", published: true, sortOrder: 2 },
  ]) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: { name: c.name, published: c.published, sortOrder: c.sortOrder },
      create: c,
    })
  }

  // Delivery zones
  const zones = [
    { name: "Accra Central", fee: 2000, sortOrder: 1 },
    { name: "Greater Accra", fee: 3500, sortOrder: 2 },
    { name: "Other Regions", fee: 6000, sortOrder: 3 },
  ]
  for (const z of zones) {
    const existingZone = await prisma.deliveryZone.findFirst({ where: { name: z.name } })
    if (!existingZone) {
      await prisma.deliveryZone.create({ data: z })
    }
  }

  // Store settings singleton
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", storeName: "Ewurahils", announcementVisible: false },
  })

  // Homepage sections
  const sectionCount = await prisma.homepageSection.count()
  if (sectionCount === 0) {
    const newArrivals = await prisma.collection.findUnique({ where: { slug: "new-arrivals" } })
    await prisma.homepageSection.createMany({
      data: [
        { type: "hero", label: "Hero", visible: true, position: 1, headline: "New Season" },
        { type: "featured-categories", label: "Featured Categories", visible: true, position: 2 },
        { type: "new-arrivals", label: "New Arrivals", visible: true, position: 3, collectionId: newArrivals?.id },
        { type: "featured-products", label: "Featured", visible: true, position: 4 },
        { type: "brand-story", label: "Brand Story", visible: true, position: 5 },
        { type: "social", label: "Social", visible: true, position: 6 },
      ],
    })
  }

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })