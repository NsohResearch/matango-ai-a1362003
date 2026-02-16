import { describe, it, expect } from "vitest";
import {
  PRICING_TIERS,
  getUpgradeCTA,
  getNextPlanId,
  getTierCTA,
  getTier,
} from "@/config/pricingTiers";

describe("pricingTiers config", () => {
  it("has 4 tiers", () => {
    expect(PRICING_TIERS).toHaveLength(4);
  });

  it("each tier has correct CTA label (no Subscribe/Get/Buy)", () => {
    const labels = PRICING_TIERS.map((t) => t.ctaLabel);
    expect(labels).toEqual(["Start Free", "Launch Creator", "Launch Agency", "Contact Sales"]);
    labels.forEach((l) => {
      expect(l).not.toMatch(/subscribe|get |buy|choose/i);
    });
  });

  it("each tier has microcopy", () => {
    PRICING_TIERS.forEach((t) => {
      expect(t.microcopy.length).toBeGreaterThan(5);
    });
  });
});

describe("getUpgradeCTA", () => {
  it("free → Launch Creator", () => {
    expect(getUpgradeCTA("free")).toBe("Launch Creator");
  });
  it("basic → Launch Agency", () => {
    expect(getUpgradeCTA("basic")).toBe("Launch Agency");
  });
  it("agency → Contact Sales", () => {
    expect(getUpgradeCTA("agency")).toBe("Contact Sales");
  });
  it("enterprise → null", () => {
    expect(getUpgradeCTA("enterprise")).toBeNull();
  });
});

describe("getNextPlanId", () => {
  it("free → basic", () => expect(getNextPlanId("free")).toBe("basic"));
  it("basic → agency", () => expect(getNextPlanId("basic")).toBe("agency"));
  it("agency → enterprise", () => expect(getNextPlanId("agency")).toBe("enterprise"));
  it("enterprise → null", () => expect(getNextPlanId("enterprise")).toBeNull());
});

describe("getTierCTA", () => {
  it("returns 'Current Plan' when tier matches current plan", () => {
    expect(getTierCTA("basic", "basic")).toBe("Current Plan");
  });
  it("returns tier CTA when not current", () => {
    expect(getTierCTA("agency", "free")).toBe("Launch Agency");
  });
});

describe("getTier", () => {
  it("finds agency tier", () => {
    expect(getTier("agency")?.displayName).toBe("Agency");
  });
  it("returns undefined for unknown", () => {
    expect(getTier("nonexistent")).toBeUndefined();
  });
});
