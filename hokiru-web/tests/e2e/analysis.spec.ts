import { expect, test } from "@playwright/test";

test("repeated incorrect answers surface the topic as a weak topic on the analysis screen", async ({ page }) => {
  // sample-001's correctChoice is index 0; choosing index 1 three times
  // guarantees 3 wrong attempts on the same topic (weak-topic threshold).
  for (let i = 0; i < 3; i++) {
    await page.goto("/practice?questionId=sample-001");
    await page.locator("main button").nth(1).click();
    await page.getByRole("button", { name: "自信あり" }).click();
    await page.getByRole("button", { name: "回答する" }).click();
    await expect(page.getByText("不正解")).toBeVisible();
  }

  await page.goto("/analysis");
  await expect(page.getByText("苦手論点")).toBeVisible();
  await expect(page.getByText("用途地域と容積率").last()).toBeVisible();
});
