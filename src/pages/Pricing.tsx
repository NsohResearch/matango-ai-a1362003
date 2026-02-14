import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Get started with AI marketing.",
    features: ["1 Brand Brain", "5 AI generations/day", "Basic templates", "K'ah Chat assistant", "Community support"],
    limits: ["No Video Studio", "No AAO automation", "Matango branding"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Basic",
    price: "$199/mo",
    desc: "For serious solopreneurs scaling content.",
    features: ["3 Brand Brains", "100 AI generations/day", "Video Studio", "Campaign Factory", "Scheduler", "All templates", "Priority support", "Remove branding"],
    limits: ["No white label", "No team features"],
    cta: "Go Basic",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$399/mo",
    desc: "Multi-brand, white-label, unlimited scale.",
    features: ["Unlimited brands", "Unlimited AI generations", "Video Studio Pro", "AAO Orchestration", "White label", "Team collaboration", "API access", "A/B Testing", "Dedicated support"],
    limits: [],
    cta: "Go Agency",
    highlighted: false,
  },
  {
    name: "Agency++",
    price: "Custom",
    desc: "Enterprise-grade with custom integrations.",
    features: ["Everything in Agency", "Custom AI model training", "SLA guarantee", "Dedicated CSM", "On-premise option", "Custom integrations", "Unlimited team seats"],
    limits: [],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-semibold text-foreground">Simple, Transparent Pricing</h1>
          <p className="mt-3 text-muted-foreground">Deploy your autonomous marketing agency today. Scale tomorrow.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-primary/10 border-2 border-primary shadow-lg ring-1 ring-primary/20"
                  : "bg-card border border-border shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block mb-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Most Popular</span>
              )}
              <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
              <div className="mt-2 font-display text-3xl font-bold">{plan.price}</div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
              <Link
                to="/auth?mode=signup"
                className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Link>
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
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Pricing;
