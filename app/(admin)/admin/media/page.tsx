import { prisma } from "@/lib/db"
import { MediaLibrary } from "@/components/admin/media-library"

export const dynamic = "force-dynamic"

export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } })
  return <MediaLibrary assets={assets} />
}