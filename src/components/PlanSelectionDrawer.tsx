/**
 * PlanSelectionDrawer — Slide-over for plan selection with Stripe checkout.
 */
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Zap, Crown, Building2, Star, ArrowRight, Loader2 } from "lucide-react";

interface PlanSelectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  origin?: "onboarding" | "upgrade" | "downgrade";
  onPlanSelected?: (planId: string) => void;
}

const STRIPE_PLANS = {
  basic: { price_id: "price_1T0cavDcq9WDEzjkilaqUz1X", product_id: "prod_TyZk4lrpOZD0eE" },
  agency: { price_id: "price_1T0cawDcq9WDEzjk4inwi8Ae", product_id: "prod_TyZkDIfLRosrEY" },
};

const plans = [
  {
    id: "free", name: "Free", price: 0, desc: "Get started with AI marketing",
    icon: Zap, features: ["1 Brand Brain", "5 AI generations/day", "Starter templates", "Community support"],
    limits: ["No video studio", "No bulk create", "Matango branding"],
  },
  {
    id: "basic", name: "Creator", price: 199, desc: "For creators building AI-driven content brands",
    icon: Star, popular: true,
    features: ["3 Brand Brains", "100 AI generations/day", "Video Studio", "All templates", "Priority support", "Remove branding"],
    limits: ["No white label", "No team features"],
  },
  {
    id: "agency", name: "Agency", price: 399, desc: "For agencies & teams",
    icon: Crown,
    features: ["Unlimited brands", "Unlimited generations", "Video Studio Pro", "White label", "Team collaboration", "API access", "Dedicated support"],
    limits: [],
  },
  {
    id: "enterprise", name: "Agency++", price: -1, desc: "Custom enterprise solution",
    icon: Building2,
    features: ["Everything in Agency", "Custom integrations", "SLA guarantee", "Dedicated CSM", "Custom training", "On-premise option"],
    limits: [],
  },
];

export default function PlanSelectionDrawer({ open, onOpenChange, origin = "onboarding", onPlanSelected }: PlanSelectionDrawerProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { subscription } = useAuth();

  const handleSelectPlan = async (planId: string) => {
    if (planId === "enterprise") {
      toast.info("Contact us at sales@matango.ai for enterprise pricing.");
      return;
    }
    if (planId === "free") {
      onPlanSelected?.(planId);
      toast.success("Free plan activated!");
      return;
    }

    const stripePlan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS];
    if (!stripePlan) return;

    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: stripePlan.price_id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Checkout opened in a new tab.");
        onPlanSelected?.(planId);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = subscription.plan || "free";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-2xl">
            {origin === "onboarding" ? "Choose Your Plan" : "Upgrade Your Plan"}
          </SheetTitle>
          <SheetDescription>
            {origin === "onboarding" ? "Start free, upgrade anytime." : "Unlock more capabilities for your growth loop."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-3 mb-6">
          <Label htmlFor="billing-toggle" className="text-sm text-muted-foreground">Monthly</Label>
          <Switch id="billing-toggle" checked={billingCycle === "yearly"} onCheckedChange={(v) => setBillingCycle(v ? "yearly" : "monthly")} />
          <Label htmlFor="billing-toggle" className="text-sm text-muted-foreground">
            Yearly <Badge variant="secondary" className="ml-1 text-[10px]">Save 20%</Badge>
          </Label>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = plan.price === -1 ? null : billingCycle === "yearly" ? Math.round(plan.price * 0.8) : plan.price;
            const isCurrent = plan.id === currentPlan;
            const isLoading = loadingPlan === plan.id;

            return (
              <Card key={plan.id} className={`relative ${plan.popular ? "border-primary ring-1 ring-primary/20" : "border-border"} ${isCurrent ? "ring-2 ring-primary" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground text-[10px]">Most Popular</Badge>
                )}
                {isCurrent && (
                  <Badge className="absolute -top-2 left-4 bg-accent text-accent-foreground text-[10px]">Your Plan</Badge>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {price !== null ? (
                      <span className="text-3xl font-bold">${price}<span className="text-sm text-muted-foreground font-normal">/mo</span></span>
                    ) : (
                      <span className="text-lg font-semibold text-muted-foreground">Contact Sales</span>
                    )}
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-3 w-3 text-primary shrink-0" />{f}</li>
                    ))}
                    {plan.limits.map((l) => (
                      <li key={l} className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-3 w-3 shrink-0" />{l}</li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrent || isLoading}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    {isCurrent ? "Current Plan" : plan.id === "free" ? "Start Free" : plan.id === "enterprise" ? "Contact Sales" : "Subscribe"}
                    {!isCurrent && !isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
