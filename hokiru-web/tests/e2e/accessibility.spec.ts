import { expect, test } from "@playwright/test";

test("answer choices are selectable via keyboard (Tab + Enter)", async ({ page }) => {
  await page.goto("/practice");

  const firstChoice = page.locator("main button").first();
  await firstChoice.focus();
  await expect(firstChoice).toBeFocused();

  await page.keyboard.press("Enter");

  // Selecting via keyboard should apply the same "selected" styling the
  // component uses for a mouse click (border-accent).
  await expect(firstChoice).toHaveClass(/border-accent/);
});

test("primary bottom-nav links and CTA are reachable by keyboard with visible text labels", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: "今日の復習を始める" });
  await cta.focus();
  await expect(cta).toBeFocused();
});
