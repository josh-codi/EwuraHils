import { describe, it, expect } from "vitest"
import {
  productSchema,
  slugSchema,
  homepageSectionSchema,
  bannerSchema,
  deliveryZoneSchema,
} from "@/lib/validation"

describe("validation", () => {
  it("validates slug", () => {
    expect(slugSchema.safeParse("hello-world").success).toBe(true)
    expect(slugSchema.safeParse("Hello World").success).toBe(false)
    expect(slugSchema.safeParse("hello--world").success).toBe(false)
  })

  it("validates product", () => {
    const res = productSchema.safeParse({ name: "Shirt", slug: "shirt", price: 10 })
    expect(res.success).toBe(true)
  })

  it("rejects negative prices", () => {
    const res = productSchema.safeParse({ name: "Shirt", slug: "shirt", price: -1 })
    expect(res.success).toBe(false)
  })

  it("only allows known homepage section types", () => {
    const ok = homepageSectionSchema.safeParse({ type: "hero", position: 1 })
    expect(ok.success).toBe(true)
    const bad = homepageSectionSchema.safeParse({ type: "raw-html", position: 1 })
    expect(bad.success).toBe(false)
  })

  it("rejects banner schedules that end before they start", () => {
    const res = bannerSchema.safeParse({
      internalTitle: "Launch",
      startsAt: "2026-02-10T10:00",
      endsAt: "2026-02-01T10:00",
    })
    expect(res.success).toBe(false)
  })

  it("accepts a valid banner schedule", () => {
    const res = bannerSchema.safeParse({
      internalTitle: "Launch",
      startsAt: "2026-02-01T10:00",
      endsAt: "2026-02-10T10:00",
    })
    expect(res.success).toBe(true)
  })

  it("rejects banner CTA urls that are not http(s)", () => {
    const res = bannerSchema.safeParse({
      internalTitle: "Launch",
      ctaUrl: "javascript:alert(1)",
    })
    expect(res.success).toBe(false)
  })

  it("validates delivery zones", () => {
    expect(deliveryZoneSchema.safeParse({ name: "Accra", fee: 20 }).success).toBe(true)
    expect(deliveryZoneSchema.safeParse({ name: "Accra", fee: -5 }).success).toBe(false)
  })
})
