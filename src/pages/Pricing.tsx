import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingComparisonMatrix from "@/components/marketing/PricingComparisonMatrix";
import PricingFAQ from "@/components/marketing/PricingFAQ";
import { Check, X, Loader2, Coins, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { PRICING_TIERS, getTierCTA, PLAN_ORDER } from "@/config/pricingTiers";

const PLAN_PRICE_IDS: Record<string, string> = {
  basic: "price_1T0cavDcq9WDEzjkilaqUz1X",
  agency: "price_1T0cawDcq9WDEzjk4inwi8Ae",
};

const CREDIT_PACKS = [
  { credits: 100, price: 10, priceId: "price_1T1ZBnDcq9WDEzjkldL4RzmE", label: "Starter" },
  { credits: 500, price: 40, priceId: "price_1T1ZBoDcq9WDEzjkus432tYV", label: "Popular", highlighted: true },
  { credits: 1000, price: 70, priceId: "price_1T1ZBpDcq9WDEzjkyS6tiq2R", label: "Best Value" },
];

const planFeatures: Record<string, { features: string[]; limits: string[] }> = {
  free: {
    features: ["1 Brand Brain", "5 AI generations/day", "Starter templates", "Ka'h Chat assistant", "Community support"],
    limits: ["No Video Studio", "No AAO automation", "Matango branding"],
  },
  basic: {
    features: ["3 Brand Brains", "100 AI generations/day", "Video Studio", "Campaign Factory", "Scheduler", "All templates", "Priority support", "Remove branding"],
    limits: ["No white label", "No team features"],
  },
  agency: {
    features: ["Unlimited brands", "Unlimited generations", "Video Studio Pro", "White label", "Team collaboration", "API access", "Dedicated support"],
    limits: [],
  },
  enterprise: {
    features: ["Everything in Agency", "Custom integrations", "SLA guarantee", "Dedicated CSM", "Custom training", "On-premise option"],
    limits: [],
  },
};

const Pricing = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingCredit, setLoadingCredit] = useState<string | null>(null);

  const currentPlan = profile?.plan || "free";
  const currentPlanIdx = PLAN_ORDER.indexOf(currentPlan as any);

  const handleCheckout = async (planKey: string) => {
    const priceId = PLAN_PRICE_IDS[planKey];
    if (!priceId) {
      if (planKey === "enterprise") {
        window.location.href = "/contact?type=agency_plus_plus";
        return;
      }
      if (planKey === "free") {
        if (!user) {
          window.location.href = "/auth?mode=signup";
        } else {
          // For downgrade to free, send to customer portal to cancel
          await openCustomerPortal();
        }
        return;
      }
      return;
    }

    if (!user) {
      window.location.href = `/auth?mode=signup&plan=${planKey}`;
      return;
    }

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, mode: "subscription" },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  const openCustomerPortal = async () => {
    setLoadingPlan("portal");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Could not open billing portal");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCreditTopUp = async (pack: typeof CREDIT_PACKS[0]) => {
    if (!user) {
      window.location.href = "/auth?mode=signup";
      return;
    }
    setLoadingCredit(pack.priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: pack.priceId, mode: "payment" },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Top-up failed");
    } finally {
      setLoadingCredit(null);
    }
  };

  const getButtonConfig = (tierId: string) => {
    const isCurrentPlan = currentPlan === tierId;
    const tierIdx = PLAN_ORDER.indexOf(tierId as any);

    if (isCurrentPlan) return { label: "Current Plan", disabled: true, variant: "current" as const };
    if (tierId === "enterprise") return { label: "Contact Sales →", disabled: false, variant: "outline" as const };
    if (tierIdx > currentPlanIdx) return { label: getTierCTA(tierId, currentPlan), disabled: false, variant: "upgrade" as const };
    return { label: `Switch to ${PRICING_TIERS.find(t => t.id === tierId)?.displayName}`, disabled: false, variant: "downgrade" as const };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl font-semibold text-foreground">Launch Your Next Level</h1>
            <p className="mt-3 text-muted-foreground">Scale your growth loop with the next tier.</p>
            {user && currentPlan !== "free" && (
              <button
                onClick={openCustomerPortal}
                disabled={loadingPlan === "portal"}
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {loadingPlan === "portal" ? "Opening..." : "Manage Subscription"}
              </button>
            )}
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => {
              const isCurrentPlan = currentPlan === tier.id;
              const feat = planFeatures[tier.id];
              const btn = getButtonConfig(tier.id);

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl p-8 relative transition-all hover:shadow-md ${
                    isCurrentPlan
                      ? "bg-primary/5 border-2 border-primary shadow-md"
                      : "bg-card border border-border shadow-sm"
                  }`}
                >
                  {isCurrentPlan && (
                    <span className="absolute -top-3 left-6 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium">
                      Your Plan
                    </span>
                  )}
                  <h3 className="font-display text-xl font-semibold">{tier.displayName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{tier.microcopy}</p>
                  <div className="mt-3 font-display text-3xl font-bold">
                    {tier.price !== null ? (
                      <>
                        ${tier.price}<span className="text-base font-normal text-muted-foreground">/mo</span>
                      </>
                    ) : (
                      "Custom"
                    )}
                  </div>

                  <div className="border-t border-border my-5" />

                  <ul className="space-y-2.5 mb-6">
                    {feat.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {feat.limits.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground/50">
                        <X className="h-4 w-4 shrink-0 mt-0.5" />
                        {l}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckout(tier.id)}
                    disabled={btn.disabled || loadingPlan === tier.id}
                    className={`block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-all disabled:cursor-not-allowed ${
                      btn.variant === "current"
                        ? "bg-muted text-muted-foreground opacity-60"
                        : btn.variant === "upgrade"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg"
                        : btn.variant === "downgrade"
                        ? "bg-secondary text-foreground hover:bg-secondary/80"
                        : "border border-primary text-primary hover:bg-primary/5"
                    }`}
                  >
                    {loadingPlan === tier.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      btn.label
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Credit Top-Up Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-xs font-medium mb-3">
                <Coins className="h-3.5 w-3.5" />
                Credit Top-Ups
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Need more credits?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Top up anytime — credits never expire and work across all AI features.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.priceId}
                  className={`rounded-xl p-6 text-center transition-all hover:shadow-md ${
                    pack.highlighted
                      ? "bg-primary/5 border-2 border-primary shadow-sm"
                      : "bg-card border border-border"
                  }`}
                >
                  {pack.highlighted && (
                    <span className="inline-block mb-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      {pack.label}
                    </span>
                  )}
                  {!pack.highlighted && (
                    <span className="inline-block mb-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      {pack.label}
                    </span>
                  )}
                  <div className="font-display text-3xl font-bold">{pack.credits}</div>
                  <p className="text-xs text-muted-foreground mt-1">credits</p>
                  <div className="mt-3 text-lg font-semibold text-foreground">${pack.price}</div>
                  <p className="text-[10px] text-muted-foreground">
                    ${(pack.price / pack.credits * 100).toFixed(0)}¢ per credit
                  </p>
                  <button
                    onClick={() => handleCreditTopUp(pack)}
                    disabled={loadingCredit === pack.priceId}
                    className={`mt-4 w-full rounded-lg py-2 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                      pack.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {loadingCredit === pack.priceId ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      "Buy Credits"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <PricingComparisonMatrix />
          <PricingFAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
