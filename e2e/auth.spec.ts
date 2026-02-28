import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show auth page", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();
  });

  test("should show signup mode via query param", async ({ page }) => {
    await page.goto("/auth?mode=signup");
    await expect(page.getByRole("button", { name: /sign up|create|deploy/i })).toBeVisible();
  });

  test("should show email input field", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test("should show password input field", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });
});
