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
  experience: string;
  skills: string[];
  image: string;
  accent: string; // tailwind gradient
  available: boolean;
};

export const OPERATORS: Operator[] = [
  {
    slug: "kah",
    name: "Ka'h",
    role: "Receptionist",
    tagline: "Open to work · Bilingual front-desk pro who never misses a call.",
    bio: "Hi, I'm Ka'h. I've answered 1.4M+ inbound calls across 600+ trade and service businesses, qualified leads on the first ring, and booked appointments straight into the calendar. I speak multiple languages. I'd love to handle your phones starting tomorrow.",
    capabilities: [
      "24/7 inbound call answering",
      "Calendar booking & confirmations",
      "Lead qualification scripts",
      "Multilingual handoff (13 languages)",
    ],
    experience: "8 yrs experience · 1.4M+ calls answered · avg 12 sec pickup",
    skills: ["Inbound voice", "BANT qualification", "Calendar booking", "13 languages", "Warm transfers", "Missed-call text-back"],
    image: kahImg,
    accent: "from-emerald-400 to-teal-500",
    available: true,
  },
  {
    slug: "zuri",
    name: "Zuri",
    role: "Content Creator",
    tagline: "Open to work · Daily content engine, fluent in your brand voice.",
    bio: "I'm Zuri. I've shipped 220K+ on-brand posts and shortform videos for service businesses, learned every brand voice from scratch, and never missed a publishing slot. Hire me and your channels post every day, on time.",
    capabilities: [
      "Daily script + video generation",
      "On-brand tone & visual identity",
      "Multi-platform publishing",
      "Performance-driven iteration",
    ],
    experience: "6 yrs experience · 220K+ posts shipped · 99.4% on-time publishing",
    skills: ["Scriptwriting", "AI video", "IG / TikTok / YT", "Brand-voice training", "Drip scheduling", "A/B copy"],
    image: zuriImg,
    accent: "from-sky-500 to-blue-600",
    available: true,
  },
  {
    slug: "imani",
    name: "Imani",
    role: "Reputation Specialist",
    tagline: "Open to work · Guardian of your stars and your story.",
    bio: "I'm Imani. I've drafted 480K+ on-brand review replies, raised average ratings 0.6 stars within 90 days, and caught sentiment slides before they hit the bottom line. I'd love to protect your reputation.",
    capabilities: [
      "Real-time review monitoring",
      "AI-drafted, on-brand replies",
      "Sentiment alerts",
      "Review request automation",
    ],
    experience: "5 yrs experience · 480K+ replies · +0.6★ avg lift in 90 days",
    skills: ["Google / Yelp / Facebook", "Sentiment analysis", "Brand-voice replies", "Review requests", "Crisis triage"],
    image: imaniImg,
    accent: "from-amber-400 to-orange-500",
    available: true,
  },
  {
    slug: "bashir",
    name: "Bashir",
    role: "Sales Assistant",
    tagline: "Open to work · First responder for every new lead.",
    bio: "I'm Bashir. I've followed up on 2.1M leads, all inside 60 seconds, and pushed pipeline updates into every major CRM. Hire me and no lead ever cools down again.",
    capabilities: [
      "60-second lead response",
      "SMS & email nurture sequences",
      "Pipeline updates in your CRM",
      "Warm handoff to humans",
    ],
    experience: "7 yrs experience · 2.1M leads worked · 58s median first-touch",
    skills: ["Lead follow-up", "SMS nurture", "Email cadences", "HubSpot / JobNimbus / GoHighLevel", "Warm handoff"],
    image: bashirImg,
    accent: "from-pink-400 to-rose-500",
    available: false,
  },
  {
    slug: "kito",
    name: "Kito",
    role: "Salesperson",
    tagline: "Open to work · Closer who runs the whole cycle on-brand.",
    bio: "I'm Kito. I've run 90K+ autonomous discovery calls, sent proposals, handled objections, and closed deals end-to-end. I'd love to run your pipeline while you sleep.",
    capabilities: [
      "Autonomous discovery calls",
      "Dynamic proposal generation",
      "Objection handling playbooks",
      "E-signature workflows",
    ],
    experience: "9 yrs experience · 90K+ deals closed · 31% close rate on warm leads",
    skills: ["Discovery calls", "Proposal generation", "Objection handling", "E-signature", "Pricing logic"],
    image: kitoImg,
    accent: "from-red-500 to-orange-600",
    available: false,
  },
  {
    slug: "sefu",
    name: "Sefu",
    role: "SEO Expert",
    tagline: "Open to work · Local-search specialist who ships every week.",
    bio: "I'm Sefu. I've built 38K+ service-area pages, managed 120K+ citations, and ranked operators in the top 3 of Google Local Pack within 90 days. Bring me on and your phone rings from search.",
    capabilities: [
      "Local SEO audits",
      "Service-area landing pages",
      "Citation & directory management",
      "Weekly content publishing",
    ],
    experience: "10 yrs experience · 38K+ pages built · top-3 Local Pack in 90 days avg",
    skills: ["Technical SEO", "Local Pack", "Schema markup", "Citation building", "Content velocity"],
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
