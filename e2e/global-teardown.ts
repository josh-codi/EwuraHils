import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { existsSync, readFileSync, unlinkSync } from "node:fs"
import { E2E_BACKUP_FILE } from "./global-setup"

export default async function globalTeardown() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  // Remove every fixture created by the E2E suite so the database is left as it was found.
  await prisma.product.deleteMany({ where: { slug: { startsWith: "e2e-" } } })
  await prisma.category.deleteMany({ where: { slug: "e2e-category" } })
  await prisma.deliveryZone.deleteMany({ where: { name: "E2E Delivery" } })

  if (existsSync(E2E_BACKUP_FILE)) {
    const backup = JSON.parse(readFileSync(E2E_BACKUP_FILE, "utf-8")) as {
      whatsappNumber: string | null
    }
    await prisma.storeSettings.update({
      where: { id: "default" },
      data: { whatsappNumber: backup.whatsappNumber },
    })
    unlinkSync(E2E_BACKUP_FILE)
  }

  await prisma.$disconnect()
  await pool.end()
}
