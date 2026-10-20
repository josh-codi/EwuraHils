"use server"

import { prisma } from "@/lib/db"
import { getStoreSettings } from "@/lib/store-settings"
import { normalizeWhatsAppNumber, buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp"
import { formatMoney } from "@/lib/money"
import { z } from "zod"
import { getDeliveryZones } from "@/lib/queries"

const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).max(99),
})

const prepareSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  deliveryZoneId: z.string().optional().nullable(),
})

export async function fetchDeliveryZones() {
  return getDeliveryZones(true)
}

export async function getCartProducts(ids: string[]) {
  if (!ids.length) return []
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, published: true },
    include: {
      media: { orderBy: { position: "asc" }, take: 1, include: { mediaAsset: true } },
      variants: { where: { active: true } },
    },
  })
  return products
}

export async function prepareWhatsAppOrder(input: z.infer<typeof prepareSchema>) {
  const data = prepareSchema.parse(input)
  const settings = await getStoreSettings()
  const number = normalizeWhatsAppNumber(settings?.whatsappNumber)
  if (!number) {
    return { ok: false as const, error: "WhatsApp number is not configured." }
  }

  const productIds = Array.from(new Set(data.items.map((i) => i.productId)))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
    include: { variants: true },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  const lines: {
    name: string
    url: string
    variant?: string
    quantity: number
    unitPrice: number
    lineSubtotal: number
  }[] = []
  const warnings: string[] = []
  const validatedItems: { productId: string; variantId: string | null; quantity: number }[] = []

  for (const item of data.items) {
    const product = productMap.get(item.productId)
    if (!product) {
      warnings.push("A product in your cart is no longer available.")
      continue
    }
    let variant = null
    if (product.variants.length > 0) {
      if (!item.variantId) {
        warnings.push(`${product.name} requires a variant selection.`)
        continue
      }
      variant = product.variants.find((v) => v.id === item.variantId)
      if (!variant || !variant.active) {
        warnings.push(`${product.name} variant is unavailable.`)
        continue
      }
    } else {
      if (item.variantId) {
        warnings.push(`${product.name} does not use variants.`)
        continue
      }
    }
    if (product.variants.length > 0) {
      const stock = variant!.stock
      if (stock < item.quantity) {
        warnings.push(`${product.name} has only ${stock} in stock.`)
        if (stock === 0) continue
        item.quantity = Math.min(item.quantity, stock)
      }
    }
    const unitPrice = variant?.priceOverride ?? product.price
    const variantLabel = variant
      ? [variant.size, variant.color].filter(Boolean).join(", ") || undefined
      : undefined
    lines.push({
      name: product.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${product.slug}`,
      variant: variantLabel,
      quantity: item.quantity,
      unitPrice,
      lineSubtotal: unitPrice * item.quantity,
    })
    validatedItems.push({ productId: product.id, variantId: variant?.id ?? null, quantity: item.quantity })
  }

  if (lines.length === 0) {
    return { ok: false as const, error: "No valid items in cart.", warnings }
  }

  const itemsSubtotal = lines.reduce((s, l) => s + l.lineSubtotal, 0)

  let deliveryZoneName: string | undefined
  let deliveryFee: number | undefined
  if (data.deliveryZoneId) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id: data.deliveryZoneId } })
    if (zone && zone.active) {
      deliveryZoneName = zone.name
      deliveryFee = zone.fee
    } else {
      warnings.push("The selected delivery area is no longer available. Please choose another.")
    }
  }

  const estimatedTotal = itemsSubtotal + (deliveryFee ?? 0)

  const message = buildWhatsAppMessage({
    storeName: settings?.storeName ?? "Store",
    lines,
    itemsSubtotal,
    deliveryZoneName,
    deliveryFee,
    estimatedTotal,
  })

  let whatsappUrl = buildWhatsAppUrl(number, message)
  let fallback = false
  if (message.length > 3000) {
    const storeName = settings?.storeName ?? "Store"
    let shortMessage = buildWhatsAppMessage({
      storeName,
      lines: lines.map((l) => ({ ...l, url: undefined })),
      itemsSubtotal,
      deliveryZoneName,
      deliveryFee,
      estimatedTotal,
    })
    if (shortMessage.length > 3000) {
      const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
      const names = lines
        .map((line) => `${line.quantity} × ${line.name}${line.variant ? ` (${line.variant})` : ""}`)
        .join(", ")
      const truncatedNames = names.length > 1200 ? `${names.slice(0, 1200)}…` : names
      shortMessage = [
        `Hello! I would like to place an order from ${storeName}:`,
        "",
        `${itemCount} item(s): ${truncatedNames}`,
        "",
        `Items subtotal: ${formatMoney(itemsSubtotal)}`,
        ...(deliveryZoneName ? [`Delivery area: ${deliveryZoneName}`] : []),
        ...(deliveryFee !== undefined
          ? [`Delivery fee: ${formatMoney(deliveryFee)}`]
          : deliveryZoneName
            ? ["Delivery fee: to be confirmed"]
            : []),
        `Estimated total: ${formatMoney(estimatedTotal)}`,
        "",
        "Please confirm product availability and delivery arrangements.",
      ].join("\n")
    }
    whatsappUrl = buildWhatsAppUrl(number, shortMessage)
    fallback = true
  }

  return {
    ok: true as const,
    itemsSubtotal,
    deliveryFee,
    deliveryZoneName,
    estimatedTotal,
    whatsappUrl,
    warnings,
    fallback,
    validatedItems,
  }
}