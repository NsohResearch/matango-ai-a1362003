import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "Get started with your first AAO.",
    features: ["1 Brand Brain", "5 AI Influencer images/mo", "3 Campaigns/mo", "Basic analytics"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49/mo",
    desc: "For growing teams deploying AAOs at scale.",
    features: ["3 Brand Brains", "100 AI images/mo", "Unlimited campaigns", "Video Studio", "Scheduler", "Advanced analytics", "A/B Testing"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$199/mo",
    desc: "Multi-brand, white-label, unlimited scale.",
    features: ["Unlimited brands", "Unlimited AI images", "White label", "Team management", "API access", "Priority support", "Custom integrations"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-cream-50">
    <Navbar />
    <main className="pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-semibold text-foreground">Simple, Transparent Pricing</h1>
          <p className="mt-3 text-muted-foreground">Deploy your AAO today. Scale tomorrow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-emerald-900 border-2 border-gold-500/40 shadow-luxury text-cream-50"
                  : "bg-card border border-border shadow-luxury-sm"
              }`}
            >
              <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
              <div className="mt-2 font-display text-3xl font-bold">{plan.price}</div>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-cream-100/60" : "text-muted-foreground"}`}>{plan.desc}</p>
              <Link
                to="/auth?mode=signup"
                className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-all ${
                  plan.highlighted
                    ? "bg-gold-500 text-emerald-950 hover:bg-gold-400"
                    : "bg-primary text-primary-foreground hover:border hover:border-gold-400"
                }`}
              >
                {plan.cta}
              </Link>
              <div className={`gold-divider my-6 ${!plan.highlighted && "opacity-30"}`} />
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlighted ? "text-cream-100/70" : "text-muted-foreground"}`}>
                    <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-gold-400" : "text-primary"}`} />
                    {f}
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
