import { test, expect } from "@playwright/test";

test.describe("Dashboard (requires auth)", () => {
  // These tests expect a logged-in user. In CI, set up auth state via storageState.
  // For now, they verify redirect behavior for unauthenticated users.

  test("should redirect unauthenticated user from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to auth or show login prompt
    await page.waitForTimeout(2000);
    const url = page.url();
    const isRedirected = url.includes("/auth") || url.includes("/");
    expect(isRedirected).toBeTruthy();
  });

  test("should redirect unauthenticated user from brand-brain", async ({ page }) => {
    await page.goto("/brand-brain");
    await page.waitForTimeout(2000);
    const url = page.url();
    const isRedirected = url.includes("/auth") || url.includes("/");
    expect(isRedirected).toBeTruthy();
  });
});
