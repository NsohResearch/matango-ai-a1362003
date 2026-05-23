import kahImg from "@/assets/aao-kah-receptionist.jpg";
import zuriImg from "@/assets/aao-zuri-content.jpg";
import imaniImg from "@/assets/aao-imani-reputation.jpg";
import bashirImg from "@/assets/aao-bashir-sales-assistant.jpg";
import kitoImg from "@/assets/aao-kito-salesperson.jpg";
import sefuImg from "@/assets/aao-sefu-seo.jpg";

export type Operator = {
  slug: string;
  name: string;
  role: string;
  tagline: string;
  bio: string;
  capabilities: string[];
  image: string;
  accent: string; // tailwind gradient
  available: boolean;
};

export const OPERATORS: Operator[] = [
  {
    slug: "kah",
    name: "Ka'h",
    role: "Receptionist",
    tagline: "Answers every call. Books every lead. Never sleeps.",
    bio: "Ka'h greets every inbound caller, qualifies the lead, and books the appointment straight into your calendar — in 13 languages, 24/7.",
    capabilities: [
      "24/7 inbound call answering",
      "Calendar booking & confirmations",
      "Lead qualification scripts",
      "Multilingual handoff (13 languages)",
    ],
    image: kahImg,
    accent: "from-emerald-400 to-teal-500",
    available: true,
  },
  {
    slug: "zuri",
    name: "Zuri",
    role: "Content Creator",
    tagline: "Turns your brand into a daily content engine.",
    bio: "Zuri studies your Brand Brain, writes the scripts, generates the video, and ships to every channel — every single day.",
    capabilities: [
      "Daily script + video generation",
      "On-brand tone & visual identity",
      "Multi-platform publishing",
      "Performance-driven iteration",
    ],
    image: zuriImg,
    accent: "from-sky-500 to-blue-600",
    available: true,
  },
  {
    slug: "imani",
    name: "Imani",
    role: "Reputation Specialist",
    tagline: "Protects your stars. Replies to every review.",
    bio: "Imani monitors Google, Yelp, and Facebook, drafts on-brand responses, and surfaces issues before they hurt your rating.",
    capabilities: [
      "Real-time review monitoring",
      "AI-drafted, on-brand replies",
      "Sentiment alerts",
      "Review request automation",
    ],
    image: imaniImg,
    accent: "from-amber-400 to-orange-500",
    available: true,
  },
  {
    slug: "bashir",
    name: "Bashir",
    role: "Sales Assistant",
    tagline: "Follows up on every lead — within 60 seconds.",
    bio: "Bashir picks up where Ka'h leaves off: instant SMS and email follow-ups, nurture sequences, and warm handoffs to your closer.",
    capabilities: [
      "60-second lead response",
      "SMS & email nurture sequences",
      "Pipeline updates in your CRM",
      "Warm handoff to humans",
    ],
    image: bashirImg,
    accent: "from-pink-400 to-rose-500",
    available: false,
  },
  {
    slug: "kito",
    name: "Kito",
    role: "Salesperson",
    tagline: "Closes deals while you sleep.",
    bio: "Kito runs full discovery calls, sends proposals, handles objections, and books the contract — fully autonomous, fully on-brand.",
    capabilities: [
      "Autonomous discovery calls",
      "Dynamic proposal generation",
      "Objection handling playbooks",
      "E-signature workflows",
    ],
    image: kitoImg,
    accent: "from-red-500 to-orange-600",
    available: false,
  },
  {
    slug: "sefu",
    name: "Sefu",
    role: "SEO Expert",
    tagline: "Ranks you in your service area. Forever.",
    bio: "Sefu audits your site, writes location-targeted pages, builds local citations, and ships fresh content weekly — built to win local search.",
    capabilities: [
      "Local SEO audits",
      "Service-area landing pages",
      "Citation & directory management",
      "Weekly content publishing",
    ],
    image: sefuImg,
    accent: "from-emerald-500 to-green-600",
    available: false,
  },
];

export const getOperator = (slug: string) => OPERATORS.find((o) => o.slug === slug);

export type Industry = {
  slug: string;
  name: string;
  emoji: string;
  headline: string;
  pain: string;
  outcome: string;
  bestOperators: string[]; // operator slugs
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "roofers",
    name: "Roofers",
    emoji: "🏠",
    headline: "Storm-season ready. Lead-pipeline overflowing.",
    pain: "Missed calls during storm season cost you $20K jobs. Crews are in the field, not on the phone.",
    outcome: "Ka'h captures every storm-damage call. Zuri ships drone-footage reels weekly. Imani protects your 5-star rating.",
    bestOperators: ["kah", "zuri", "imani"],
  },
  {
    slug: "hvac",
    name: "HVAC",
    emoji: "❄️",
    headline: "Every emergency call answered. Every tune-up upsold.",
    pain: "Heatwaves and cold snaps spike call volume 10x. Voicemail = lost revenue.",
    outcome: "Ka'h triages emergencies in seconds. Bashir books maintenance plans on autopilot. Sefu ranks you for 'AC repair near me.'",
    bestOperators: ["kah", "bashir", "sefu"],
  },
  {
    slug: "solar",
    name: "Solar",
    emoji: "☀️",
    headline: "Long sales cycles, fully automated.",
    pain: "Solar leads take 60+ days to close. Manual nurture drops the ball every time.",
    outcome: "Kito runs the discovery, sends proposals, and handles objections. Zuri produces before/after install reels.",
    bestOperators: ["kito", "zuri", "bashir"],
  },
  {
    slug: "med-spas",
    name: "Med Spas",
    emoji: "💎",
    headline: "Booked-out calendar. Glowing reviews.",
    pain: "Beauty buyers research everything. One bad review tanks bookings for a month.",
    outcome: "Imani protects your reputation. Zuri creates aspirational treatment content. Ka'h books consults in 13 languages.",
    bestOperators: ["imani", "zuri", "kah"],
  },
  {
    slug: "chiropractors",
    name: "Chiropractors",
    emoji: "🩺",
    headline: "Educate, attract, retain.",
    pain: "Patients need education before they trust you. You don't have time to be a content creator.",
    outcome: "Zuri turns your expertise into daily educational reels. Ka'h books new-patient appointments around the clock.",
    bestOperators: ["zuri", "kah", "sefu"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    emoji: "🏘️",
    headline: "Every listing, fully marketed in 60 seconds.",
    pain: "Top agents spend 40% of their week on marketing instead of closing.",
    outcome: "Zuri auto-generates listing reels the second a property hits MLS. Ka'h handles inbound buyer calls.",
    bestOperators: ["zuri", "kah", "kito"],
  },
  {
    slug: "auto-repair",
    name: "Auto Repair",
    emoji: "🔧",
    headline: "Service bays full. Customers loyal.",
    pain: "Customers shop on price. You compete on trust — but nobody hears your story.",
    outcome: "Sefu ranks you for 'mechanic near me.' Imani turns happy customers into 5-star reviews. Bashir runs reminder sequences.",
    bestOperators: ["sefu", "imani", "bashir"],
  },
];

export const getIndustry = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);
