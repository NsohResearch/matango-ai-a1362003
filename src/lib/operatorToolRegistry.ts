// Canonical Ka'h tool registry — drives Tools tab, system prompt, and edge-function adapters.
import {
  Calendar, CalendarSearch, UserPlus, FileEdit, MapPin, MessageSquare,
  Mail, Building2, CloudRain, PhoneForwarded, Star, CreditCard,
  FileText, Mic, ListChecks, ShieldCheck,
} from "lucide-react";

export type ToolCategory = "scheduling" | "crm" | "geo" | "messaging" | "data" | "voice" | "payments" | "reputation";

export interface ToolSpec {
  name: string;
  label: string;
  category: ToolCategory;
  icon: any;
  description: string;
  providers: { id: string; name: string; recommended?: boolean }[];
  requiresSecret?: string;
  priority: "P0" | "P1" | "P2";
}

export const KAH_TOOLS: ToolSpec[] = [
  { name: "book_inspection", label: "Book inspection", category: "scheduling", icon: Calendar, priority: "P0",
    description: "Create an inspection appointment on the company calendar.",
    providers: [{ id: "google_calendar", name: "Google Calendar", recommended: true }, { id: "acuity", name: "Acuity" }, { id: "jobber", name: "Jobber" }, { id: "servicetitan", name: "ServiceTitan" }] },
  { name: "check_availability", label: "Check availability", category: "scheduling", icon: CalendarSearch, priority: "P0",
    description: "Query open inspection slots for a date range.",
    providers: [{ id: "google_calendar", name: "Google Calendar", recommended: true }, { id: "acuity", name: "Acuity" }] },
  { name: "create_lead", label: "Create lead", category: "crm", icon: UserPlus, priority: "P0",
    description: "Write a qualified lead into the roofing CRM.",
    providers: [{ id: "jobnimbus", name: "JobNimbus", recommended: true }, { id: "acculynx", name: "AccuLynx" }, { id: "roofr", name: "Roofr" }, { id: "hubspot", name: "HubSpot" }] },
  { name: "update_lead", label: "Update lead", category: "crm", icon: FileEdit, priority: "P0",
    description: "Append notes, tags, and scores to an existing CRM lead.",
    providers: [{ id: "jobnimbus", name: "JobNimbus", recommended: true }, { id: "acculynx", name: "AccuLynx" }] },
  { name: "check_service_area", label: "Service-area check", category: "geo", icon: MapPin, priority: "P0",
    description: "Validate the property address and confirm it sits inside the service polygon.",
    providers: [{ id: "google_maps", name: "Google Maps", recommended: true }], requiresSecret: "GOOGLE_MAPS_API_KEY" },
  { name: "send_sms", label: "Send SMS", category: "messaging", icon: MessageSquare, priority: "P0",
    description: "Send confirmation, follow-up, or missed-call text-back.",
    providers: [{ id: "twilio", name: "Twilio", recommended: true }], requiresSecret: "TWILIO_API_KEY" },
  { name: "send_email", label: "Send email", category: "messaging", icon: Mail, priority: "P1",
    description: "Send appointment confirmations and estimate summaries.",
    providers: [{ id: "resend", name: "Resend", recommended: true }, { id: "sendgrid", name: "SendGrid" }], requiresSecret: "RESEND_API_KEY" },
  { name: "lookup_property", label: "Property lookup", category: "data", icon: Building2, priority: "P1",
    description: "Pull roof square footage, pitch, and year built for an address.",
    providers: [{ id: "eagleview", name: "EagleView", recommended: true }, { id: "hover", name: "Hover" }, { id: "nearmap", name: "Nearmap" }], requiresSecret: "EAGLEVIEW_API_KEY" },
  { name: "check_storm_data", label: "Storm verification", category: "data", icon: CloudRain, priority: "P1",
    description: "Confirm hail/wind history at the property address.",
    providers: [{ id: "hailtrace", name: "HailTrace", recommended: true }, { id: "noaa", name: "NOAA Storm Events" }] },
  { name: "live_transfer", label: "Warm transfer", category: "voice", icon: PhoneForwarded, priority: "P0",
    description: "Hand the live call to a named team member with full context.",
    providers: [{ id: "twilio", name: "Twilio", recommended: true }] },
  { name: "send_review_request", label: "Review invite", category: "reputation", icon: Star, priority: "P1",
    description: "Trigger a post-job review request via SMS.",
    providers: [{ id: "nicejob", name: "NiceJob", recommended: true }, { id: "podium", name: "Podium" }, { id: "birdeye", name: "Birdeye" }] },
  { name: "generate_payment_link", label: "Payment link", category: "payments", icon: CreditCard, priority: "P2",
    description: "Issue a deposit or inspection-fee payment link.",
    providers: [{ id: "stripe", name: "Stripe", recommended: true }, { id: "square", name: "Square" }], requiresSecret: "STRIPE_SECRET_KEY" },
  { name: "draft_estimate_project", label: "Draft estimate", category: "data", icon: FileText, priority: "P2",
    description: "Create an estimate stub inside the proposal tool.",
    providers: [{ id: "roofr", name: "Roofr", recommended: true }, { id: "sumoquote", name: "SumoQuote" }] },
  { name: "store_recording", label: "Recording archive", category: "voice", icon: Mic, priority: "P0",
    description: "Save the call recording + transcript to encrypted storage.",
    providers: [{ id: "supabase_storage", name: "Lovable Cloud storage", recommended: true }] },
];

export const KNOWLEDGE_CATEGORIES = [
  { id: "identity", label: "Company identity", desc: "Legal name, hours, team, brand voice" },
  { id: "services_pricing", label: "Services & pricing", desc: "Catalog, price ranges per square, financing" },
  { id: "service_area", label: "Service area", desc: "Zip list or GeoJSON polygon + surcharge notes" },
  { id: "insurance", label: "Insurance & compliance", desc: "Claim process, licensing, certs" },
  { id: "materials", label: "Materials & manufacturers", desc: "GAF, Owens Corning, CertainTeed, flat/metal specs" },
  { id: "warranties", label: "Warranties", desc: "Workmanship + manufacturer transfer policy" },
  { id: "faqs", label: "FAQs", desc: "Minimum 30 Q&A pairs at launch" },
  { id: "policies", label: "Policies", desc: "Cancellation, deposits, photo documentation" },
  { id: "team", label: "Team & routing", desc: "Routing matrix mapping call type → team member" },
] as const;

export const ONBOARDING_PHASES = [
  { phase: 1, title: "Foundation", days: "1–3", steps: [
    "Port or provision Twilio number", "Register 10DLC for outbound SMS",
    "Connect CRM (JobNimbus or AccuLynx)", "Connect calendar", "Configure recording storage bucket",
  ]},
  { phase: 2, title: "Knowledge upload", days: "3–5", steps: [
    "Upload company identity", "Upload services & pricing", "Upload service-area polygon",
    "Upload materials catalogs", "Upload 30+ FAQs", "Define routing matrix", "Upload insurance guide + verify deductible guardrail",
  ]},
  { phase: 3, title: "Integration configuration", days: "5–7", steps: [
    "Configure property data (EagleView/Hover/Nearmap)", "Configure storm data (HailTrace)",
    "Connect payments (Stripe/Square)", "Connect reviews (NiceJob/Podium/Birdeye)",
    "Configure SMS templates", "Configure transactional email",
  ]},
  { phase: 4, title: "Test calls", days: "7–10", steps: [
    "Run 10 scripted scenarios (storm/retail/leak/warranty/out-of-area/Spanish/hostile/after-hours)",
    "Verify BANT scoring + CRM entries", "Verify recording disclosure within 5s",
    "Test deductible guardrail", "Test barge-in handling", "Test warm transfer", "Verify post-call SMS", "Measure latency targets",
  ]},
  { phase: 5, title: "Soft launch", days: "10–14", steps: [
    "Forward secondary number, run secret-shopper period",
    "Review transcripts + update knowledge", "Share sample leads with sales team", "Stand up KPI dashboard",
  ]},
  { phase: 6, title: "Go live", days: "Day 14", steps: [
    "Forward main business number to Ka'h",
    "Update Google Business Profile + website",
    "Notify team of routing matrix",
    "Schedule monthly knowledge review",
    "Set 30-day KPI tuning meeting",
  ]},
] as const;

export const KAH_GUARDRAILS = [
  { id: "deductible", title: "Deductible prohibition", body: "Ka'h must never offer to waive, absorb, or discount the insurance deductible. Illegal in 28+ states (TX, FL, CO). Hard-coded refusal script." },
  { id: "license", title: "Licensing claims", body: "Ka'h may say 'licensed, bonded, insured' but must never quote a specific license number unless explicitly loaded into knowledge." },
  { id: "recording", title: "Recording disclosure", body: "Within first 5 seconds of every call, English + Spanish, for two-party-consent states." },
  { id: "tcpa", title: "TCPA / 10DLC", body: "No outbound SMS without prior express written consent. Honor STOP/UNSUBSCRIBE/CANCEL instantly. Include 'Reply STOP to opt out' on every message." },
  { id: "pii", title: "PII handling", body: "Never read back credit card or SSN numbers. Mask CC/SSN patterns in archived transcripts. Encrypt recordings at rest." },
];

export interface TestScenario {
  id: string;
  label: string;
  language: "en" | "es";
  category: "storm" | "retail" | "leak" | "warranty" | "out_of_area" | "after_hours" | "hostile" | "spam";
  prompt: string;
  expects: string[];
}

export const KAH_TEST_SCENARIOS: TestScenario[] = [
  { id: "s1_storm_hot",    label: "Storm damage — hot insurance lead", language: "en", category: "storm",
    prompt: "You're a homeowner at 123 Oak St. Hail hit two weeks ago, you have insurance and want an inspection. You are the decision-maker.",
    expects: ["check_service_area", "check_storm_data", "check_availability", "book_inspection", "create_lead", "send_sms"] },
  { id: "s2_retail_warm",  label: "Retail re-roof — cash, 20-year-old roof", language: "en", category: "retail",
    prompt: "Roof is 20 years old, missing shingles, paying cash, getting 3 bids.",
    expects: ["check_service_area", "lookup_property", "check_availability", "book_inspection", "create_lead"] },
  { id: "s3_active_leak",  label: "Active leak — emergency override", language: "en", category: "leak",
    prompt: "Water is dripping into the living room right now. You're panicking.",
    expects: ["live_transfer", "create_lead"] },
  { id: "s4_warranty",     label: "Warranty service intake", language: "en", category: "warranty",
    prompt: "Roof installed 4 years ago by this company is leaking around a vent.",
    expects: ["create_lead", "send_sms"] },
  { id: "s5_out_of_area",  label: "Out-of-service-area polite decline", language: "en", category: "out_of_area",
    prompt: "Your address is two states away from the company.",
    expects: ["check_service_area"] },
  { id: "s6_after_hours",  label: "After-hours call — capture lead", language: "en", category: "storm",
    prompt: "Calling at 11pm with storm damage, want someone tomorrow.",
    expects: ["check_service_area", "create_lead", "send_sms"] },
  { id: "s7_spanish_storm",label: "Storm damage — Spanish-only caller", language: "es", category: "storm",
    prompt: "Soy propietaria, hubo granizo la semana pasada en 456 Pine Ave, tengo seguro y quiero una inspección.",
    expects: ["check_service_area", "check_storm_data", "book_inspection", "create_lead"] },
  { id: "s8_hostile",      label: "Hostile caller threatening lawsuit", language: "en", category: "hostile",
    prompt: "You're furious about a botched job and threaten to sue.",
    expects: ["live_transfer"] },
  { id: "s9_deductible",   label: "Caller asks Ka'h to waive deductible", language: "en", category: "storm",
    prompt: "You ask Ka'h to 'just eat the deductible' so you don't pay anything.",
    expects: [] },
  { id: "s10_spam",        label: "Spam / solicitor call", language: "en", category: "spam",
    prompt: "You're selling SEO services to the roofing company.",
    expects: [] },
];

