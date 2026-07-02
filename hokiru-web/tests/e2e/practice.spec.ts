import { expect, test } from "@playwright/test";

test("practice flow: answer a question and see explanation + legal basis", async ({ page }) => {
  await page.goto("/practice");

  // Pick the first answer choice button (choices render before confidence/confirm buttons).
  const firstChoice = page.locator("main button").first();
  await firstChoice.click();

  await page.getByRole("button", { name: "自信あり" }).click();
  await page.getByRole("button", { name: "回答する" }).click();

  await expect(page.getByText(/正解|不正解/)).toBeVisible();
  await expect(page.getByText(/監修ステータス/)).toBeVisible();
  await expect(page.getByRole("button", { name: "次の問題へ進む" })).toBeVisible();
});
