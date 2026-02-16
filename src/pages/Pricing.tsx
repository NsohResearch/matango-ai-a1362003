import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingComparisonMatrix from "@/components/marketing/PricingComparisonMatrix";
import PricingFAQ from "@/components/marketing/PricingFAQ";
import { Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const PLAN_PRICE_IDS: Record<string, string> = {
  basic: "price_1RVWxeAVFAUaQJO0iiFSNq1F",
  agency: "price_1RVWySAVFAUaQJO0VyNz3TJo",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    key: "free",
    desc: "Get started with AI marketing.",
    tagline: "Best for exploration and testing.",
    features: ["1 Brand Brain", "5 AI generations/day", "Starter templates", "Ka'h Chat assistant", "Community support"],
    limits: ["No Video Studio", "No AAO automation", "Matango branding"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Creator",
    price: "$199/mo",
    key: "basic",
    desc: "For creators building consistent, high-impact AI-driven content brands.",
    tagline: "Ideal for founders building consistent output.",
    features: ["3 Brand Brains", "100 AI generations/day", "Video Studio", "Campaign Factory", "Scheduler", "All templates", "Priority support", "Remove branding"],
    limits: ["No white label", "No team features"],
    cta: "Go Creator",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$399/mo",
    key: "agency",
    desc: "Multi-brand, white-label, unlimited scale.",
    tagline: "Built for agencies and multi-brand operators.",
    features: ["Unlimited brands", "Unlimited AI generations", "Video Studio Pro", "AAO Orchestration", "White label", "Team collaboration", "API access", "A/B Testing", "Dedicated support"],
    limits: [],
    cta: "Go Agency",
    highlighted: false,
  },
  {
    name: "Agency++",
    price: "Custom",
    key: "enterprise",
    desc: "Enterprise-grade with custom integrations.",
    tagline: "For enterprise AI-native marketing operations.",
    features: ["Everything in Agency", "Custom AI model training", "SLA guarantee", "Dedicated CSM", "On-premise option", "Custom integrations", "Unlimited team seats"],
    limits: [],
    cta: "Contact Sales",
    highlighted: false,
  },
];

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
        window.location.href = "/auth?mode=signup";
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
            {plans.map((plan) => {
              const isCurrentPlan = subscription.plan === plan.key;
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 relative ${
                    plan.highlighted
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
                  {plan.highlighted && !isCurrentPlan && (
                    <span className="inline-block mb-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Most Popular</span>
                  )}
                  <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-2 font-display text-3xl font-bold">{plan.price}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={isCurrentPlan || loadingPlan === plan.key}
                    className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {loadingPlan === plan.key ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      plan.cta
                    )}
                  </button>
                  <p className="mt-3 text-xs text-muted-foreground text-center">{plan.tagline}</p>
                  <div className="border-t border-border my-6" />
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                    {plan.limits.map((l) => (
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
