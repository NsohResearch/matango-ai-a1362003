import { describe, it, expect } from "vitest";
import { estimateCredits, formatCredits, CREDIT_COSTS } from "@/lib/credits";

describe("Credit Cost Model", () => {
  it("all operations have positive base costs", () => {
    Object.entries(CREDIT_COSTS).forEach(([op, cost]) => {
      expect(cost).toBeGreaterThan(0);
    });
  });

  it("estimateCredits returns base cost for non-video ops", () => {
    expect(estimateCredits("influencer-assist")).toBe(3);
    expect(estimateCredits("script-generate")).toBe(8);
    expect(estimateCredits("brand-enrich")).toBe(5);
    expect(estimateCredits("suggestion")).toBe(1);
  });

  it("estimateCredits scales with duration for video ops", () => {
    const base = CREDIT_COSTS["image-to-video-preview"];
    // 5 seconds = 1 unit
    expect(estimateCredits("image-to-video-preview", 5)).toBe(base);
    // 10 seconds = 2 units
    expect(estimateCredits("image-to-video-preview", 10)).toBe(base * 2);
    // 7 seconds = ceil(7/5) = 2 units
    expect(estimateCredits("image-to-video-preview", 7)).toBe(base * 2);
  });

  it("estimateCredits applies quality multiplier", () => {
    const base = CREDIT_COSTS["influencer-assist"];
    expect(estimateCredits("influencer-assist", undefined, "preview_low")).toBe(Math.round(base * 0.5));
    expect(estimateCredits("influencer-assist", undefined, "hd_1080p")).toBe(Math.round(base * 1.5));
    expect(estimateCredits("influencer-assist", undefined, "pro_4k")).toBe(Math.round(base * 2.5));
  });

  it("estimateCredits handles unknown quality as 1.0x", () => {
    expect(estimateCredits("suggestion", undefined, "unknown")).toBe(CREDIT_COSTS.suggestion);
  });

  it("formatCredits pluralizes correctly", () => {
    expect(formatCredits(0)).toBe("0 credits");
    expect(formatCredits(1)).toBe("1 credit");
    expect(formatCredits(5)).toBe("5 credits");
    expect(formatCredits(100)).toBe("100 credits");
  });
});
