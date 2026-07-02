import { expect, test } from "@playwright/test";

test("home shows today's summary and the primary CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "今日の復習を始める" })).toBeVisible();
  await expect(page.getByText(/今日の復習 \d+ 件/)).toBeVisible();
});

test("bottom nav links to all five tabs", async ({ page }) => {
  await page.goto("/");
  for (const label of ["ホーム", "演習", "復習", "分析", "設定"]) {
    await expect(page.getByRole("link", { name: label, exact: true })).toBeVisible();
  }
});
