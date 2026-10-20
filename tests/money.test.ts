import { describe, it, expect } from "vitest"
import { formatMoney } from "@/lib/money"

describe("formatMoney", () => {
  it("formats pesewas", () => {
    expect(formatMoney(25000)).toContain("250")
  })
})