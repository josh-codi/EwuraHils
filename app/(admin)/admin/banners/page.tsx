import { prisma } from "@/lib/db"
import { BannersManager } from "@/components/admin/banners-manager"

export const dynamic = "force-dynamic"

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { displayOrder: "asc" },
    include: { mediaAsset: true },
  })
  return <BannersManager banners={banners} />
}