export type WhatsAppLine = {
  name: string
  url?: string
  variant?: string
  quantity: number
  unitPrice: number // pesewas
  lineSubtotal: number // pesewas
}

export type WhatsAppMessageInput = {
  storeName: string
  lines: WhatsAppLine[]
  itemsSubtotal: number
  deliveryZoneName?: string
  deliveryFee?: number
  estimatedTotal: number
  currency?: string
}

export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 10 || digits.length > 15) return null
  if (digits.startsWith("0")) {
    return "233" + digits.slice(1)
  }
  return digits
}

export function buildWhatsAppMessage(input: WhatsAppMessageInput): string {
  const lines: string[] = []
  lines.push(`Hello! I would like to place an order from ${input.storeName}:`)
  lines.push("")
  input.lines.forEach((l, idx) => {
    lines.push(`${idx + 1}. ${l.name}${l.variant ? ` — ${l.variant}` : ""}`)
    if (l.url) lines.push(`   Product link: ${l.url}`)
    lines.push(`   Quantity: ${l.quantity}`)
    lines.push(`   Unit price: ${formatMoneyPesewas(l.unitPrice)}`)
    lines.push(`   Subtotal: ${formatMoneyPesewas(l.lineSubtotal)}`)
    lines.push("")
  })
  lines.push(`Items subtotal: ${formatMoneyPesewas(input.itemsSubtotal)}`)
  if (input.deliveryZoneName) {
    lines.push(`Delivery area: ${input.deliveryZoneName}`)
  }
  if (input.deliveryFee !== undefined) {
    lines.push(`Delivery fee: ${formatMoneyPesewas(input.deliveryFee)}`)
  } else if (input.deliveryZoneName) {
    lines.push("Delivery fee: to be confirmed")
  }
  lines.push(`Estimated total: ${formatMoneyPesewas(input.estimatedTotal)}`)
  lines.push("")
  lines.push("Please confirm product availability and delivery arrangements.")
  return lines.join("\n")
}

function formatMoneyPesewas(pesewas: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(pesewas / 100)
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(number)
  if (!normalized) return ""
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function estimateMessageLength(message: string): number {
  return message.length
}

export const WHATSAPP_SAFE_URL_LENGTH = 1500