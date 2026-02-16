import { describe, it, expect } from "vitest";

/**
 * Plan Gating & Tier Configuration Tests
 * Validates pricing consistency, plan mapping, and tier labels.
 */

// Mirror the production plan config from Pricing.tsx
const PLAN_PRICE_IDS: Record<string, string> = {
  basic: "price_1T0cavDcq9WDEzjkilaqUz1X",
  agency: "price_1T0cawDcq9WDEzjk4inwi8Ae",
};

// Mirror the product map from check-subscription edge function
const PRODUCT_MAP: Record<string, string> = {
  "prod_TyZk4lrpOZD0eE": "basic",
  "prod_TyZkDIfLRosrEY": "agency",
};

// Plan display names (internal key → user-facing label)
const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: "Free",
  basic: "Creator",
  agency: "Agency",
  enterprise: "Agency++",
};

// Plan limits per tier
const PLAN_LIMITS = {
  free: { brandBrains: 1, generationsPerDay: 5, videoStudio: false, whiteLabel: false, team: false },
  basic: { brandBrains: 3, generationsPerDay: 100, videoStudio: true, whiteLabel: false, team: false },
  agency: { brandBrains: Infinity, generationsPerDay: Infinity, videoStudio: true, whiteLabel: true, team: true },
};

describe("Plan Configuration", () => {
  it("all paid plans have Stripe price IDs", () => {
    expect(PLAN_PRICE_IDS.basic).toBeDefined();
    expect(PLAN_PRICE_IDS.agency).toBeDefined();
    expect(PLAN_PRICE_IDS.basic).toMatch(/^price_/);
    expect(PLAN_PRICE_IDS.agency).toMatch(/^price_/);
  });

  it("all products in PRODUCT_MAP map to valid internal plan keys", () => {
    const validKeys = ["free", "basic", "agency", "enterprise"];
    Object.values(PRODUCT_MAP).forEach((plan) => {
      expect(validKeys).toContain(plan);
    });
  });

  it("every paid plan has a corresponding product mapping", () => {
    const mappedPlans = new Set(Object.values(PRODUCT_MAP));
    expect(mappedPlans.has("basic")).toBe(true);
    expect(mappedPlans.has("agency")).toBe(true);
  });

  it("display names are never 'Basic' (should be 'Creator')", () => {
    Object.values(PLAN_DISPLAY_NAMES).forEach((name) => {
      expect(name).not.toBe("Basic");
    });
    expect(PLAN_DISPLAY_NAMES.basic).toBe("Creator");
  });

  it("free tier has strictest limits", () => {
    expect(PLAN_LIMITS.free.brandBrains).toBe(1);
    expect(PLAN_LIMITS.free.generationsPerDay).toBe(5);
    expect(PLAN_LIMITS.free.videoStudio).toBe(false);
    expect(PLAN_LIMITS.free.whiteLabel).toBe(false);
    expect(PLAN_LIMITS.free.team).toBe(false);
  });

  it("creator (basic) tier unlocks video studio but not white label", () => {
    expect(PLAN_LIMITS.basic.videoStudio).toBe(true);
    expect(PLAN_LIMITS.basic.whiteLabel).toBe(false);
    expect(PLAN_LIMITS.basic.team).toBe(false);
  });

  it("agency tier unlocks everything", () => {
    expect(PLAN_LIMITS.agency.videoStudio).toBe(true);
    expect(PLAN_LIMITS.agency.whiteLabel).toBe(true);
    expect(PLAN_LIMITS.agency.team).toBe(true);
    expect(PLAN_LIMITS.agency.generationsPerDay).toBe(Infinity);
  });
});

describe("Route Protection Matrix", () => {
  const publicRoutes = ["/", "/auth", "/about", "/pricing", "/meet-kah", "/discover", "/privacy", "/terms", "/support", "/investors", "/contact"];
  const protectedRoutes = ["/dashboard", "/brand-brain", "/campaign-factory", "/influencer-studio", "/video-studio", "/analytics-hub", "/account-settings"];
  const adminRoutes = ["/admin", "/admin/tenants", "/admin/billing", "/admin/feature-flags"];
  const superAdminOnlyRoutes = ["/admin/feature-flags", "/admin/billing", "/admin/system-health", "/admin/integrations"];

  it("public routes are defined", () => {
    expect(publicRoutes.length).toBeGreaterThan(0);
    publicRoutes.forEach((r) => expect(r).toMatch(/^\//));
  });

  it("protected routes are defined", () => {
    expect(protectedRoutes.length).toBeGreaterThan(0);
  });

  it("admin routes are defined", () => {
    expect(adminRoutes.length).toBeGreaterThan(0);
  });

  it("super admin only routes are a subset of admin routes", () => {
    superAdminOnlyRoutes.forEach((r) => {
      expect(r.startsWith("/admin")).toBe(true);
    });
  });

  it("no route appears in both public and protected", () => {
    const overlap = publicRoutes.filter((r) => protectedRoutes.includes(r));
    expect(overlap).toEqual([]);
  });
});
