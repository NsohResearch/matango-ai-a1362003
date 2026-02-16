import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingComparisonMatrix from "@/components/marketing/PricingComparisonMatrix";
import PricingFAQ from "@/components/marketing/PricingFAQ";
import { Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { PRICING_TIERS, getTierCTA } from "@/config/pricingTiers";

const PLAN_PRICE_IDS: Record<string, string> = {
  basic: "price_1T0cavDcq9WDEzjkilaqUz1X",
  agency: "price_1T0cawDcq9WDEzjk4inwi8Ae",
};

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
    features: ["Unlimited brands", "Unlimited AI generations", "Video Studio Pro", "AAO Orchestration", "White label", "Team collaboration", "API access", "A/B Testing", "Dedicated support"],
    limits: [],
  },
  enterprise: {
    features: ["Everything in Agency", "Custom AI model training", "SLA guarantee", "Dedicated CSM", "On-premise option", "Custom integrations", "Unlimited team seats"],
    limits: [],
  },
};

const Pricing = () => {
  const { user, subscription } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    const priceId = PLAN_PRICE_IDS[planKey];
    if (!priceId) {
      if (planKey === "enterprise") {
        window.location.href = "/contact?type=agency_plus_plus";
        return;
      }
      if (planKey === "free") {
        window.location.href = user ? "/dashboard" : "/auth?mode=signup";
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
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = subscription.plan || "free";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl font-semibold text-foreground">Simple, Transparent Pricing</h1>
            <p className="mt-3 text-muted-foreground">Deploy your autonomous marketing agency today. Scale tomorrow.</p>
            <a href="#compare" className="mt-4 inline-block text-sm text-primary hover:text-gold-400 transition-colors">Compare plans ↓</a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => {
              const isCurrentPlan = currentPlan === tier.id;
              const feat = planFeatures[tier.id];
              const ctaLabel = getTierCTA(tier.id, currentPlan);
              const isHighlighted = tier.id === "basic";

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl p-8 relative transition-all hover:shadow-md ${
                    isHighlighted
                      ? "bg-primary/10 border-2 border-primary shadow-lg ring-1 ring-primary/20"
                      : isCurrentPlan
                      ? "bg-primary/5 border-2 border-primary/50 shadow-md"
                      : "bg-card border border-border shadow-sm"
                  }`}
                >
                  {isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium">
                      Your Plan
                    </span>
                  )}
                  {isHighlighted && !isCurrentPlan && (
                    <span className="inline-block mb-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Most Popular</span>
                  )}
                  <h3 className="font-display text-xl font-semibold">{tier.displayName}</h3>
                  <div className="mt-2 font-display text-3xl font-bold">
                    {tier.price !== null ? `$${tier.price}/mo` : "Custom"}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.microcopy}</p>
                  <button
                    onClick={() => handleCheckout(tier.id)}
                    disabled={isCurrentPlan || loadingPlan === tier.id}
                    aria-label={isCurrentPlan ? `${tier.displayName} is your current plan` : `${tier.ctaLabel} plan`}
                    className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg ${
                      isHighlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {loadingPlan === tier.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      ctaLabel
                    )}
                  </button>
                  <div className="border-t border-border my-6" />
                  <ul className="space-y-3">
                    {feat.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                    {feat.limits.map((l) => (
                      <li key={l} className="flex items-center gap-2 text-sm text-muted-foreground/50">
                        <X className="h-4 w-4 shrink-0" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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
