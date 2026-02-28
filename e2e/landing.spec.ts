import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load and show hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/matango/i);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("should navigate to pricing", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/pricing"]');
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.getByText(/pricing/i).first()).toBeVisible();
  });

  test("should navigate to about", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);
  });

  test("should show login button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/login/i)).toBeVisible();
  });
});
