import { prisma } from "@/lib/db"

export async function getStoreSettings() {
  return prisma.storeSettings.findUnique({ where: { id: "default" }, include: { logoMedia: true, faviconMedia: true, defaultSocialImageMedia: true } })
}