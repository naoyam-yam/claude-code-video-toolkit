import { expect, test } from "@playwright/test";

/**
 * Lightweight LCP proxy without a full Lighthouse CI setup (see
 * docs/operations/dod.md Performance DoD). Uses the browser's own
 * PerformanceObserver for the largest-contentful-paint entry — the same
 * metric Lighthouse reports, just measured directly against production
 * build output instead of via a separate audit tool.
 */
async function measureLCP(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          resolve(last.startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });

        // In case LCP never fires (e.g. no paintable content), don't hang the test.
        setTimeout(() => resolve(-1), 4000);
      })
  );
}

for (const path of ["/", "/practice"]) {
  test(`LCP for ${path} is under 2.5s`, async ({ page }) => {
    await page.goto(path);
    const lcp = await measureLCP(page);
    expect(lcp).toBeGreaterThan(0);
    expect(lcp).toBeLessThan(2500);
  });
}
