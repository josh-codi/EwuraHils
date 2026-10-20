import { prisma } from "@/lib/db"
import { DeliveryManager } from "@/components/admin/delivery-manager"

export const dynamic = "force-dynamic"

export default async function DeliveryPage() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } })
  return <DeliveryManager zones={zones} />
}