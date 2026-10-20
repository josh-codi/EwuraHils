import { describe, it, expect } from "vitest"
import { isBannerActive } from "@/lib/banners"

describe("isBannerActive", () => {
  it("respects published and dates", async () => {
    const now = new Date()
    expect(isBannerActive({ published: false, startsAt: null, endsAt: null })).toBe(false)
    expect(isBannerActive({ published: true, startsAt: null, endsAt: null })).toBe(true)
    const future = new Date(now.getTime() + 100000)
    expect(isBannerActive({ published: true, startsAt: future, endsAt: null })).toBe(false)
    const past = new Date(now.getTime() - 100000)
    expect(isBannerActive({ published: true, startsAt: null, endsAt: past })).toBe(false)
  })
})