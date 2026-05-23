// Ka'h Receptionist pricing — separate from the platform tiers (Free/Basic/Agency).
// These are per-deployment, per-location subscriptions for the AI receptionist.

export interface KahTier {
  id: "pilot" | "solo" | "crew" | "fleet" | "enterprise";
  name: string;
  price: number;            // USD/month
  priceId?: string;         // Stripe price id (recurring)
  setupPriceId?: string;    // one-time setup fee
  setupFee?: number;        // USD
  tagline: string;
  builtFor: string;
  numbers: string;
  calls: string;
  highlight?: boolean;
  features: string[];
  notes?: string;
}

export const KAH_TIERS: KahTier[] = [
  {
    id: "pilot",
    name: "Pilot",
    price: 0,
    tagline: "14-day proof on your own line",
    builtFor: "Trying Ka'h before porting numbers",
    numbers: "Web-call only",
    calls: "100 answered calls",
    features: [
      "Web-based test calls",
      "Full knowledge base loader",
      "All 10 test scenarios",
      "EN + ES bilingual",
      "Recording archive (30 days)",
    ],
    notes: "No payment method required.",
  },
  {
    id: "solo",
    name: "Solo",
    price: 299,
    priceId: "price_1Ta7jYDcq9WDEzjkLxqm3CbV",
    tagline: "1 truck, 1 number, 24/7",
    builtFor: "Owner-operators",
    numbers: "1 provisioned number",
    calls: "500 answered calls/mo",
    features: [
      "1 CRM + 1 calendar",
      "EN + ES bilingual",
      "Missed-call SMS text-back",
      "Basic KPI dashboard",
      "Recording archive (1 year)",
      "Email support",
    ],
  },
  {
    id: "crew",
    name: "Crew",
    price: 699,
    priceId: "price_1Ta7jaDcq9WDEzjkrH57nQAd",
    setupPriceId: "price_1Ta7jdDcq9WDEzjkpXd0SgmR",
    setupFee: 499,
    tagline: "Most popular — 2–10 trucks",
    builtFor: "Growing roofing companies",
    numbers: "2 numbers",
    calls: "2,000 answered calls/mo",
    highlight: true,
    features: [
      "Everything in Solo",
      "EagleView / HailTrace add-on slots",
      "Warm transfer with hot-lead routing",
      "Automated review requests",
      "Full guardrails + DNC scrub",
      "Advanced KPI targets",
      "Priority email support",
    ],
  },
  {
    id: "fleet",
    name: "Fleet",
    price: 1499,
    priceId: "price_1Ta7jbDcq9WDEzjkMwJ9leiR",
    setupPriceId: "price_1Ta7jeDcq9WDEzjkHqJK4Db1",
    setupFee: 1499,
    tagline: "10–40 trucks, multi-location",
    builtFor: "Multi-location operators",
    numbers: "5 numbers",
    calls: "7,500 answered calls/mo",
    features: [
      "Everything in Crew",
      "Multi-location routing matrix",
      "Custom voice clone",
      "API webhooks",
      "Priority SLA (1-hour response)",
      "Dedicated onboarding manager",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    tagline: "40+ trucks / franchises",
    builtFor: "Networks & franchises",
    numbers: "Unlimited numbers",
    calls: "Unlimited",
    features: [
      "Everything in Fleet",
      "Dedicated CSM",
      "Custom integrations",
      "White-label option",
      "On-prem deployment option",
      "Volume discounts",
    ],
    notes: "Contact sales for pricing.",
  },
];

export const KAH_OVERAGES = [
  { label: "Answered call beyond cap", price: "$0.18" },
  { label: "Outbound SMS", price: "$0.04" },
  { label: "Warm-transfer minute", price: "$0.30" },
];
