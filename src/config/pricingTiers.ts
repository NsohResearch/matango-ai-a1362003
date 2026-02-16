/**
 * Centralized pricing tier configuration.
 * All CTA labels, display names, and tier metadata live here.
 * No backend or Stripe logic — presentation layer only.
 */

export interface PricingTier {
  id: "free" | "basic" | "agency" | "enterprise";
  displayName: string;
  ctaLabel: string;
  microcopy: string;
  price: number | null; // null = custom pricing
  isEnterprise?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    displayName: "Free",
    ctaLabel: "Start Free",
    microcopy: "Explore AI marketing at your own pace.",
    price: 0,
  },
  {
    id: "basic",
    displayName: "Creator",
    ctaLabel: "Launch Creator",
    microcopy: "Best for solopreneurs scaling content.",
    price: 199,
  },
  {
    id: "agency",
    displayName: "Agency",
    ctaLabel: "Launch Agency",
    microcopy: "Built for multi-brand operators.",
    price: 399,
  },
  {
    id: "enterprise",
    displayName: "Agency++",
    ctaLabel: "Contact Sales",
    microcopy: "Enterprise-grade customization.",
    price: null,
    isEnterprise: true,
  },
];

export const PLAN_ORDER = ["free", "basic", "agency", "enterprise"] as const;

/** Returns the CTA for upgrading from the current plan. */
export function getUpgradeCTA(currentPlan: string): string | null {
  if (currentPlan === "free") return "Launch Creator";
  if (currentPlan === "basic") return "Launch Agency";
  if (currentPlan === "agency") return "Contact Sales";
  return null;
}

/** Returns the next plan id for upgrading. */
export function getNextPlanId(currentPlan: string): string | null {
  const idx = PLAN_ORDER.indexOf(currentPlan as any);
  if (idx === -1 || idx >= PLAN_ORDER.length - 1) return null;
  return PLAN_ORDER[idx + 1];
}

/** Get tier config by id. */
export function getTier(id: string): PricingTier | undefined {
  return PRICING_TIERS.find((t) => t.id === id);
}

/** Get CTA label for a specific tier, respecting current plan state. */
export function getTierCTA(tierId: string, currentPlan: string): string {
  if (tierId === currentPlan) return "Current Plan";
  const tier = getTier(tierId);
  return tier?.ctaLabel || "Start Free";
}
