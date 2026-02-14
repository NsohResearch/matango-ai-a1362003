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
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-bold">Simple, Transparent Pricing</h1>
          <p className="mt-3 text-muted-foreground">Deploy your AAO today. Scale tomorrow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-primary/5 border-2 border-primary glow-primary"
                  : "glass-card"
              }`}
            >
              <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
              <div className="mt-2 font-display text-3xl font-bold">{plan.price}</div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
              <Link
                to="/auth?mode=signup"
                className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
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
