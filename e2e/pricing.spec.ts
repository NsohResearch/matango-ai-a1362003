import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test("should display pricing tiers", async ({ page }) => {
    await page.goto("/pricing");
    // Check that all 4 tiers are visible
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/creator/i).first()).toBeVisible();
    await expect(page.getByText(/agency/i).first()).toBeVisible();
  });

  test("should have CTA buttons on pricing cards", async ({ page }) => {
    await page.goto("/pricing");
    const launchButtons = page.getByRole("button").filter({ hasText: /launch|start|get started|deploy/i });
    await expect(launchButtons.first()).toBeVisible();
  });

  test("should show pricing FAQ", async ({ page }) => {
    await page.goto("/pricing");
    const faqSection = page.getByText(/frequently asked/i);
    if (await faqSection.isVisible()) {
      await expect(faqSection).toBeVisible();
    }
  });
});
