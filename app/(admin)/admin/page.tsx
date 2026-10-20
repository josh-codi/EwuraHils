import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const [published, drafts, variants, activeCampaigns, recent] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.product.count({ where: { published: false } }),
    prisma.productVariant.findMany({
      where: { active: true },
      select: { stock: true, lowStockThreshold: true },
    }),
    prisma.banner.count({ where: { published: true } }),
    prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
  ])

  const lowStock = variants.filter((v) => v.stock > 0 && v.stock <= v.lowStockThreshold).length
  const outOfStock = variants.filter((v) => v.stock === 0).length

  const stats = [
    { label: "Published products", value: published },
    { label: "Draft products", value: drafts },
    { label: "Low-stock variants", value: lowStock },
    { label: "Out-of-stock variants", value: outOfStock },
    { label: "Active campaigns", value: activeCampaigns },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-medium">Recent products</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {recent.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span>{p.name}</span>
              <span className="text-muted-foreground">{p.published ? "Published" : "Draft"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}