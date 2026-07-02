import { expect, test } from "@playwright/test";

/**
 * PR-review screenshots. Run via `npm run screenshots` (scripts/generate-screenshots.ts)
 * or `npx playwright test tests/e2e/screenshots.spec.ts`. Output goes to
 * screenshots/output/ (gitignored) and is uploaded as a CI artifact by
 * .github/workflows/screenshot.yml.
 */
const pages = [
  { path: "/", name: "home" },
  { path: "/practice", name: "practice" },
  { path: "/review", name: "review" },
  { path: "/analysis", name: "analysis" },
  { path: "/settings", name: "settings" },
];

for (const { path, name } of pages) {
  test(`screenshot: ${name}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({ path: `screenshots/output/${name}.png`, fullPage: true });
  });
}
