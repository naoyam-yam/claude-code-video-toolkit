import { expect, test } from "@playwright/test";

test("saving settings persists examDate/pace/defaultIntervalDays across reload", async ({ page }) => {
  await page.goto("/settings");

  await page.locator('input[type="date"]').fill("2026-10-11");
  await page.locator("select").selectOption("fast");
  await page.locator('input[type="number"]').fill("3");
  await page.getByRole("button", { name: "保存する" }).click();

  await page.reload();

  await expect(page.locator('input[type="date"]')).toHaveValue("2026-10-11");
  await expect(page.locator("select")).toHaveValue("fast");
  await expect(page.locator('input[type="number"]')).toHaveValue("3");
});

test("resetting data clears answer history, review state, and settings", async ({ page }) => {
  // Create some state: answer a question, then change a setting.
  await page.goto("/practice");
  await page.locator("main button").first().click();
  await page.getByRole("button", { name: "自信あり" }).click();
  await page.getByRole("button", { name: "回答する" }).click();

  await page.goto("/settings");
  await page.locator('input[type="date"]').fill("2026-10-11");
  await page.getByRole("button", { name: "保存する" }).click();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "データをリセットする" }).click();
  await page.waitForLoadState("networkidle");

  await expect(page.locator('input[type="date"]')).toHaveValue("");
  await expect(page.locator("select")).toHaveValue("standard");

  await page.goto("/review");
  await expect(page.getByText(/今日復習すべき問題はありません/)).toBeVisible();
});
