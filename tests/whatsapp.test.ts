import { describe, it, expect } from "vitest"
import { normalizeWhatsAppNumber, buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp"

describe("normalizeWhatsAppNumber", () => {
  it("strips non-digits", () => {
    expect(normalizeWhatsAppNumber("+233 20 123 4567")).toBe("233201234567")
  })
  it("converts leading zero", () => {
    expect(normalizeWhatsAppNumber("0201234567")).toBe("233201234567")
  })
  it("returns null for too short", () => {
    expect(normalizeWhatsAppNumber("123")).toBeNull()
  })
  it("returns null when empty", () => {
    expect(normalizeWhatsAppNumber(null)).toBeNull()
    expect(normalizeWhatsAppNumber(undefined)).toBeNull()
  })
})

describe("buildWhatsAppMessage", () => {
  it("includes items and totals", () => {
    const msg = buildWhatsAppMessage({
      storeName: "Test",
      lines: [{ name: "Shirt", variant: "M, Green", quantity: 1, unitPrice: 25000, lineSubtotal: 25000 }],
      itemsSubtotal: 25000,
      deliveryZoneName: "Accra",
      deliveryFee: 2000,
      estimatedTotal: 27000,
    })
    expect(msg).toContain("Shirt")
    expect(msg).toContain("M, Green")
    expect(msg).toContain("Estimated total")
    expect(msg).toContain("Delivery fee")
  })

  it("marks the delivery fee as to be confirmed when only a zone is known", () => {
    const msg = buildWhatsAppMessage({
      storeName: "Test",
      lines: [{ name: "Shirt", quantity: 2, unitPrice: 25000, lineSubtotal: 50000 }],
      itemsSubtotal: 50000,
      deliveryZoneName: "Accra",
      estimatedTotal: 50000,
    })
    expect(msg).toContain("Delivery fee: to be confirmed")
  })

  it("omits delivery details when no zone is selected", () => {
    const msg = buildWhatsAppMessage({
      storeName: "Test",
      lines: [{ name: "Shirt", quantity: 1, unitPrice: 25000, lineSubtotal: 25000 }],
      itemsSubtotal: 25000,
      estimatedTotal: 25000,
    })
    expect(msg).not.toContain("Delivery area")
    expect(msg).not.toContain("Delivery fee")
  })

  it("does not claim the order is confirmed", () => {
    const msg = buildWhatsAppMessage({
      storeName: "Test",
      lines: [{ name: "Shirt", quantity: 1, unitPrice: 25000, lineSubtotal: 25000 }],
      itemsSubtotal: 25000,
      estimatedTotal: 25000,
    })
    expect(msg).toContain("Please confirm")
    expect(msg.toLowerCase()).not.toContain("order confirmed")
  })
})

describe("buildWhatsAppUrl", () => {
  it("builds a wa.me link with the normalised number and encoded message", () => {
    const url = buildWhatsAppUrl("+233 20 123 4567", "Hello & welcome")
    expect(url.startsWith("https://wa.me/233201234567?text=")).toBe(true)
    expect(decodeURIComponent(url.split("?text=")[1])).toBe("Hello & welcome")
  })

  it("returns an empty string for an invalid number", () => {
    expect(buildWhatsAppUrl("123", "Hi")).toBe("")
  })
})
