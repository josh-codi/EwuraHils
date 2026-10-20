import { prisma } from "@/lib/db"
import { HomepageManager } from "@/components/admin/homepage-manager"
import { HOMEPAGE_SECTION_TYPES, type HomepageSectionType } from "@/lib/homepage-types"

export const dynamic = "force-dynamic"

export default async function HomepagePage() {
  const [rawSections, collections, banners] = await Promise.all([
    prisma.homepageSection.findMany({ orderBy: { position: "asc" } }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.banner.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, internalTitle: true } }),
  ])
  const sections = rawSections
    .filter((s) => HOMEPAGE_SECTION_TYPES.includes(s.type as HomepageSectionType))
    .map((s) => ({ ...s, type: s.type as HomepageSectionType }))
  return <HomepageManager sections={sections} collections={collections} banners={banners} />
}
