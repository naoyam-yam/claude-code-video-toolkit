import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Some sandboxed environments pre-install a Chromium build outside
// Playwright's usual cache and block the CDN download this package's
// pinned version would otherwise fetch. Fall back to it when present;
// CI machines without it just use the normal downloaded browser.
const localChromiumPath = "/opt/pw-browsers/chromium";
const chromiumExecutablePath = existsSync(localChromiumPath) ? localChromiumPath : undefined;

// Containers that run tests as root (common in CI and sandboxed dev
// environments) need --no-sandbox or Chromium refuses to launch at all.
const chromiumLaunchOptions = {
  executablePath: chromiumExecutablePath,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: chromiumLaunchOptions },
    },
    {
      name: "mobile-iphone",
      use: { ...devices["iPhone 13"], launchOptions: chromiumLaunchOptions },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
