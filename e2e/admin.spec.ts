import { test, expect } from "@playwright/test"

test("admin requires authentication and rejects unauthenticated API calls", async ({ page, request }) => {
  const res = await request.post("/api/admin/media/sign", {
    data: { folder: "products", resourceType: "image" },
  })
  expect(res.status()).toBe(401)

  await page.goto("/admin")
  await expect(page).toHaveURL(/\/admin\/login/)
  await expect(page.getByRole("heading", { name: "Admin login" })).toBeVisible()
})

test("authorized admin can create and publish a product", async ({ page }) => {
  const slug = `e2e-created-${Date.now()}`
  await page.goto("/admin/login")
  await page.getByLabel("Email").fill("admin@example.com")
  await page.getByLabel("Password").fill("changeme123")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible()

  await page.goto("/admin/products/new")
  await page.getByLabel("Name").fill("E2E Created Dress")
  await page.getByLabel("Slug").fill(slug)
  await page.getByLabel("Price (GHS)").fill("180")
  await page.getByPlaceholder("Stock").first().fill("3")
  await page.getByRole("checkbox", { name: "Published" }).click()
  await page.getByRole("button", { name: "Save" }).click()

  await expect(page).toHaveURL(/\/admin\/products\/(?!new$)[^/]+$/)
  await expect(page.getByRole("heading", { name: "Edit product" })).toBeVisible()
  await page.goto(`/products/${slug}`)
  await expect(page.getByRole("heading", { name: "E2E Created Dress", level: 1 })).toBeVisible()
  await expect(page.getByRole("button", { name: "Add to bag" })).toBeEnabled()
})
