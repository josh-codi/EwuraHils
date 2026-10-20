import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

export const E2E_WHATSAPP_NUMBER = "233201234567"
export const E2E_BACKUP_FILE = join(tmpdir(), "ewurahils-e2e-backup.json")

export default async function globalSetup() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  const admin = await prisma.adminUser.findUnique({ where: { email: "admin@example.com" } })
  if (!admin) {
    await prisma.adminUser.create({
      data: {
        email: "admin@example.com",
        name: "Store Admin",
        passwordHash: await bcrypt.hash("changeme123", 12),
        role: "ADMIN",
      },
    })
  }

  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } })
  if (!settings) {
    await prisma.storeSettings.create({
      data: { id: "default", storeName: "Ewurahils", whatsappNumber: E2E_WHATSAPP_NUMBER },
    })
    writeFileSync(E2E_BACKUP_FILE, JSON.stringify({ whatsappNumber: null }))
  } else if (!settings.whatsappNumber) {
    await prisma.storeSettings.update({
      where: { id: "default" },
      data: { whatsappNumber: E2E_WHATSAPP_NUMBER },
    })
    writeFileSync(E2E_BACKUP_FILE, JSON.stringify({ whatsappNumber: null }))
  } else {
    writeFileSync(
      E2E_BACKUP_FILE,
      JSON.stringify({ whatsappNumber: settings.whatsappNumber })
    )
  }

  const zone = await prisma.deliveryZone.findFirst({ where: { name: "E2E Delivery" } })
  if (!zone) {
    await prisma.deliveryZone.create({ data: { name: "E2E Delivery", fee: 2000, sortOrder: 99 } })
  }

  const category = await prisma.category.upsert({
    where: { slug: "e2e-category" },
    update: { name: "E2E Category" },
    create: { name: "E2E Category", slug: "e2e-category", sortOrder: 99 },
  })

  const draft = await prisma.product.findUnique({ where: { slug: "e2e-draft-product" } })
  if (!draft) {
    await prisma.product.create({
      data: {
        name: "E2E Draft Product",
        slug: "e2e-draft-product",
        price: 10000,
        published: false,
        variants: { create: [{ stock: 1, sku: "E2E-DRAFT" }] },
      },
    })
  }

  const existing = await prisma.product.findUnique({ where: { slug: "e2e-linen-shirt" } })
  if (!existing) {
    await prisma.product.create({
      data: {
        name: "E2E Linen Shirt",
        slug: "e2e-linen-shirt",
        description: "A test product for automated storefront checks.",
        price: 25000,
        compareAtPrice: 30000,
        published: true,
        newArrival: true,
        categoryId: category.id,
        variants: {
          create: [
            { size: "M", color: "Green", stock: 5, lowStockThreshold: 2, sku: "E2E-SHIRT-M" },
            { size: "L", color: "Green", stock: 0, lowStockThreshold: 2, sku: "E2E-SHIRT-L" },
          ],
        },
      },
    })
  }

  await prisma.$disconnect()
  await pool.end()
}