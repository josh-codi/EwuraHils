import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://localhost:3002",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm exec next dev -p 3002",
    url: "http://localhost:3002",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXTAUTH_URL: "http://localhost:3002",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3002",
    },
  },
})