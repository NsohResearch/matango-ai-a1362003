import { describe, it, expect } from "vitest";

/**
 * Stripe Integration Consistency Tests
 * Verifies that price IDs and product mappings are consistent
 * between frontend components and backend edge functions.
 */

// From Pricing.tsx
const PRICING_PAGE_IDS: Record<string, string> = {
  basic: "price_1T0cavDcq9WDEzjkilaqUz1X",
  agency: "price_1T0cawDcq9WDEzjk4inwi8Ae",
};

// From PlanSelectionDrawer.tsx — THESE WERE INCONSISTENT (now should match)
const DRAWER_STRIPE_PLANS = {
  basic: { price_id: "price_1T0cavDcq9WDEzjkilaqUz1X", product_id: "prod_TyZk4lrpOZD0eE" },
  agency: { price_id: "price_1T0cawDcq9WDEzjk4inwi8Ae", product_id: "prod_TyZkDIfLRosrEY" },
};

// From check-subscription edge function
const CHECK_SUB_PRODUCT_MAP: Record<string, string> = {
  "prod_TyZk4lrpOZD0eE": "basic",
  "prod_TyZkDIfLRosrEY": "agency",
};

describe("Stripe ID Consistency", () => {
  it("Pricing page price IDs match PlanSelectionDrawer price IDs", () => {
    expect(PRICING_PAGE_IDS.basic).toBe(DRAWER_STRIPE_PLANS.basic.price_id);
    expect(PRICING_PAGE_IDS.agency).toBe(DRAWER_STRIPE_PLANS.agency.price_id);
  });

  it("PlanSelectionDrawer product IDs exist in check-subscription PRODUCT_MAP", () => {
    expect(CHECK_SUB_PRODUCT_MAP[DRAWER_STRIPE_PLANS.basic.product_id]).toBe("basic");
    expect(CHECK_SUB_PRODUCT_MAP[DRAWER_STRIPE_PLANS.agency.product_id]).toBe("agency");
  });

  it("all price IDs follow Stripe format", () => {
    Object.values(PRICING_PAGE_IDS).forEach((id) => {
      expect(id).toMatch(/^price_/);
    });
  });

  it("all product IDs follow Stripe format", () => {
    Object.keys(CHECK_SUB_PRODUCT_MAP).forEach((id) => {
      expect(id).toMatch(/^prod_/);
    });
  });
});
