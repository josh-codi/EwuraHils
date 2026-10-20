import { test, expect } from "@playwright/test"

test("homepage and shop load database content", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("h1").first()).toBeVisible()
  await page.getByRole("link", { name: "Shop", exact: true }).first().click()
  await expect(page.getByText("E2E Linen Shirt")).toBeVisible()
})

test("variant selection, cart persistence, delivery estimate and WhatsApp handoff", async ({ page }) => {
  await page.goto("/products/e2e-linen-shirt")
  await expect(page.getByRole("heading", { name: "E2E Linen Shirt" })).toBeVisible()
  await page.getByRole("button", { name: "M / Green" }).click()
  await page.getByRole("button", { name: "Add to bag" }).click()
  await page.goto("/cart")
  await expect(page.getByText("E2E Linen Shirt").first()).toBeVisible()
  await page.reload()
  await expect(page.getByText("E2E Linen Shirt").first()).toBeVisible()

  await page.getByRole("combobox").click()
  await page.getByRole("option", { name: /E2E Delivery/ }).click()
  await expect(page.getByText("Delivery fee")).toBeVisible()

  const popupPromise = page.waitForEvent("popup")
  await page.getByRole("button", { name: /Order via WhatsApp/ }).click()
  const popup = await popupPromise
  await expect(popup).toHaveURL(/233201234567/)
  const text = new URL(popup.url()).searchParams.get("text") ?? ""
  expect(text).toContain("E2E Linen Shirt")
  expect(text).toContain("Estimated total")
})

test("unpublished content is not public", async ({ page }) => {
  const res = await page.goto("/products/e2e-draft-product")
  expect(res?.status()).toBe(404)
})
