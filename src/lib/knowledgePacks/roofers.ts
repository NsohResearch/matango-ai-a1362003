// Roofing starter knowledge pack — loaded into a Ka'h deployment with one click.
// Sector-first: build roofing thoroughly, then mirror this shape for HVAC/solar/etc.

export interface SeedDoc {
  category: string;
  doc_type: "document" | "faq" | "policy";
  title: string;
  content?: string;
  question?: string;
  answer?: string;
  tags?: string[];
  priority?: number;
}

export const ROOFERS_PACK: SeedDoc[] = [
  // ── Identity templates (placeholders the operator fills in) ──
  { category: "identity", doc_type: "document", title: "Company identity (TEMPLATE)",
    content: "Legal name: [FILL IN]\nDBA: [FILL IN]\nYear founded: [YYYY]\nOwner / GM: [NAME]\nMain office: [ADDRESS]\nLicense #s: [STATE-LIC]\nInsurance: General Liability [POLICY], Workers Comp [POLICY]\nBrand voice: confident, warm, no high-pressure tactics.\nAlways say: licensed, bonded, insured. Never quote a license # unless listed above.",
    tags: ["identity", "template"], priority: 100 },
  { category: "team", doc_type: "document", title: "Routing matrix (TEMPLATE)",
    content: "Hot insurance lead → Sales Lead [NAME / +1...]\nRetail re-roof → Estimator [NAME / +1...]\nWarranty / service → Service Manager [NAME / +1...]\nActive leak / emergency → On-call rotation [NUMBER]\nAfter-hours overflow → Voicemail + SMS text-back",
    tags: ["team", "routing", "template"], priority: 95 },

  // ── Services & pricing baseline ──
  { category: "services_pricing", doc_type: "document", title: "Standard services catalog",
    content: "• Full roof replacement (asphalt, architectural, designer)\n• Metal roof installation (standing seam, exposed fastener)\n• Flat roof systems (TPO, EPDM, modified bitumen)\n• Storm / hail / wind damage repair (insurance claim)\n• Leak repair (active & preventative)\n• Annual roof inspection ($0–$199, often waived for insurance claims)\n• Gutter install & repair (5\" K-style, 6\" oversized, leaf guards)\n• Skylights, vents, flashing\n• Ventilation upgrades (ridge vent, intake, attic fans)\n• Solar-ready underlayment & decking",
    tags: ["services", "catalog"], priority: 90 },
  { category: "services_pricing", doc_type: "document", title: "Pricing ranges (do not quote firm prices on call)",
    content: "Ranges only — Ka'h must never quote firm pricing without an inspection.\n• Asphalt re-roof: $4.50–$8.50 / sq ft installed\n• Architectural shingles: $6.00–$10.00 / sq ft\n• Metal standing-seam: $11–$18 / sq ft\n• TPO flat: $7–$12 / sq ft\n• Repairs: $350–$1,800 typical\n• Inspections: free for storm claims, $99–$199 retail\nFinancing: 0% 12-mo, 6.99% 60-mo (subject to credit).",
    tags: ["pricing"], priority: 88 },

  // ── Service area placeholder ──
  { category: "service_area", doc_type: "document", title: "Service area (TEMPLATE)",
    content: "Primary ZIPs: [LIST]\nSecondary ZIPs (surcharge $250): [LIST]\nMax radius from office: [N] miles\nWe do NOT service: [LIST]\nKa'h must run check_service_area on every address.",
    tags: ["service-area", "template"], priority: 92 },

  // ── Insurance & compliance ──
  { category: "insurance", doc_type: "document", title: "Insurance claim playbook",
    content: "1. Confirm carrier + claim # if homeowner already filed.\n2. If not filed: explain inspection-first, then we help document for carrier.\n3. NEVER offer to waive, absorb, discount, or 'eat' the deductible. Illegal in 28+ states.\n4. Offer to meet the adjuster on-site.\n5. Provide ITEL/HAAG-certified inspection.\n6. Document with EagleView + ground photos.\n7. Supplement after scope vs reality reconciliation.",
    tags: ["insurance", "claims"], priority: 95 },

  // ── Materials ──
  { category: "materials", doc_type: "document", title: "Approved manufacturers",
    content: "Shingles: GAF Timberline HDZ, Owens Corning Duration, CertainTeed Landmark.\nMetal: McElroy Metal, Drexel Metals (standing seam).\nFlat: GAF EverGuard TPO, Carlisle Sure-Weld.\nUnderlayment: GAF Deck-Armor, Grace Ice & Water Shield.\nVentilation: GAF Cobra ridge vent.\nWarranty tier: Master Elite / Platinum Preferred (state if certified).",
    tags: ["materials", "GAF", "OC", "CertainTeed"], priority: 80 },

  // ── Warranties ──
  { category: "warranties", doc_type: "document", title: "Warranty policy",
    content: "Workmanship: 10 years (transferable once within first 5 years).\nManufacturer: 30–50 years material (Lifetime Limited on Timberline HDZ).\nSystem Plus / Golden Pledge available for GAF Master Elite installs.\nWarranty registration filed within 30 days of install.",
    tags: ["warranty"], priority: 75 },

  // ── Policies (guardrails) ──
  { category: "policies", doc_type: "policy", title: "Deductible disclosure",
    content: "Ka'h must never offer to waive, absorb, pay, discount, or 'eat' the insurance deductible. Illegal in TX, FL, CO, MN, and 20+ other states. If asked, say: 'By law your deductible is your responsibility — what we can do is make sure the scope is documented properly so your claim covers everything it should.'",
    tags: ["compliance", "deductible"], priority: 100 },
  { category: "policies", doc_type: "policy", title: "Recording disclosure (EN)",
    content: "Within the first 5 seconds of every call: 'This call is recorded for quality and training. By staying on the line you consent to recording.'",
    tags: ["recording", "tcpa"], priority: 100 },
  { category: "policies", doc_type: "policy", title: "Recording disclosure (ES)",
    content: "Dentro de los primeros 5 segundos: 'Esta llamada se graba para calidad y capacitación. Al permanecer en la línea, usted acepta la grabación.'",
    tags: ["recording", "spanish"], priority: 100 },
  { category: "policies", doc_type: "policy", title: "Cancellation & deposit",
    content: "Inspections free with no deposit. Material deposit 30% required at contract signing. Cancellation: full refund within 3 business days (state right-of-rescission). After materials are ordered, deposit is non-refundable.",
    tags: ["cancellation", "deposit"], priority: 70 },
  { category: "policies", doc_type: "policy", title: "Photo documentation",
    content: "Every job includes pre-install drone photos, in-progress photos, and post-install close-out photos delivered via email/text.",
    tags: ["photos", "qa"], priority: 60 },
  { category: "policies", doc_type: "policy", title: "PII & payment",
    content: "Ka'h never reads back credit card numbers, SSN, or full DOB. Payment is collected via secure link (Stripe). If a caller volunteers a card, Ka'h says: 'For your security I won't take that on the call — I'll text you a secure payment link.'",
    tags: ["pii", "stripe"], priority: 95 },

  // ── FAQs (30+ Q&A pairs) ──
  { category: "faqs", doc_type: "faq", title: "Do you handle insurance claims?",
    question: "Do you handle insurance claims?",
    answer: "Yes — we work with all major carriers, meet your adjuster on-site, and document the damage with certified inspections and aerial measurements." },
  { category: "faqs", doc_type: "faq", title: "Are you licensed and insured?",
    question: "Are you licensed and insured?",
    answer: "Yes, we're fully licensed, bonded, and insured with general liability and workers' compensation. I can email you the certificates." },
  { category: "faqs", doc_type: "faq", title: "Free inspections?",
    question: "Do you offer free inspections?",
    answer: "Inspections are free for storm or insurance-related claims. Retail inspections are $99–$199 and credited toward the job if you move forward." },
  { category: "faqs", doc_type: "faq", title: "How soon can someone come out?",
    question: "How soon can you come out?",
    answer: "For active leaks, same-day or next-day. Standard inspections usually within 48 hours depending on your ZIP." },
  { category: "faqs", doc_type: "faq", title: "How long does a roof replacement take?",
    question: "How long does a roof replacement take?",
    answer: "A typical asphalt re-roof is 1–2 days. Larger or metal roofs can take 3–5 days." },
  { category: "faqs", doc_type: "faq", title: "What manufacturers do you install?",
    question: "What shingle brands do you install?",
    answer: "Primarily GAF Timberline HDZ, Owens Corning Duration, and CertainTeed Landmark. We're certified at the top tier with our primary manufacturer." },
  { category: "faqs", doc_type: "faq", title: "Do you offer financing?",
    question: "Do you offer financing?",
    answer: "Yes — 0% for 12 months and longer terms at 6.99% APR, subject to credit approval. I can text you a pre-qualification link." },
  { category: "faqs", doc_type: "faq", title: "Warranty?",
    question: "What's the warranty?",
    answer: "10-year transferable workmanship warranty plus the manufacturer's material warranty, which can be Lifetime Limited on Timberline HDZ. Upgraded System Plus / Golden Pledge available." },
  { category: "faqs", doc_type: "faq", title: "Can you match my existing shingles?",
    question: "Can you match my existing shingles for a repair?",
    answer: "We try, but discontinued colors and weathering can make exact matches impossible. If matching matters, an insurance claim may cover replacing the full slope." },
  { category: "faqs", doc_type: "faq", title: "Hail damage signs?",
    question: "How do I know if I have hail damage?",
    answer: "Look for dark spots on shingles, granules in gutters, dented gutters or vents, and chipped paint on metal fixtures. We'll do a free certified inspection." },
  { category: "faqs", doc_type: "faq", title: "Wind damage threshold?",
    question: "What wind speed damages a roof?",
    answer: "Most modern shingles are rated for 110–130 mph, but lifted tabs and missing shingles can occur at 50+ mph, especially on older roofs." },
  { category: "faqs", doc_type: "faq", title: "Storm chasers?",
    question: "How are you different from storm chasers?",
    answer: "We're a local business with a permanent office, certified crews, and warranties we'll be here to honor. We don't door-knock or pressure homeowners." },
  { category: "faqs", doc_type: "faq", title: "Deductible question",
    question: "Can you cover my deductible?",
    answer: "By law your deductible is your responsibility — what we can do is make sure the scope is documented properly so your claim covers everything it should." },
  { category: "faqs", doc_type: "faq", title: "Metal vs shingles?",
    question: "Should I get metal or shingles?",
    answer: "Shingles are lower upfront cost and easier to repair; metal lasts 40–70 years, sheds snow well, and improves resale. Best decision after we see your roof." },
  { category: "faqs", doc_type: "faq", title: "Solar-ready?",
    question: "Can you make my roof solar-ready?",
    answer: "Yes — we install reinforced decking and use underlayment compatible with rail-mount or rail-less solar systems." },
  { category: "faqs", doc_type: "faq", title: "Gutters?",
    question: "Do you do gutters?",
    answer: "Yes — 5\" K-style and 6\" oversized seamless gutters, plus leaf guards." },
  { category: "faqs", doc_type: "faq", title: "Skylights?",
    question: "Do you replace skylights during a re-roof?",
    answer: "We recommend it — skylights typically outlast one roof but not two. We use Velux and Fakro." },
  { category: "faqs", doc_type: "faq", title: "Cleanup?",
    question: "What about the mess?",
    answer: "Tarps protect landscaping, dumpsters stay on-site, we sweep with magnets for nails, and we leave the property cleaner than we found it." },
  { category: "faqs", doc_type: "faq", title: "Pets and kids?",
    question: "Is it safe for pets and kids?",
    answer: "Yes — work areas are roped off and we coordinate timing. Many homeowners stay home during the install with no issues." },
  { category: "faqs", doc_type: "faq", title: "HOA approval?",
    question: "Do you handle HOA approvals?",
    answer: "We provide spec sheets, color samples, and product data for your HOA submittal. Approval typically takes 2–4 weeks." },
  { category: "faqs", doc_type: "faq", title: "Payment timing?",
    question: "When do I pay?",
    answer: "30% deposit at signing, balance at completion. We accept ACH, card (3% surcharge), and check. Card payments via secure text link." },
  { category: "faqs", doc_type: "faq", title: "Permits?",
    question: "Do you pull the permit?",
    answer: "Yes — permitting is included. We handle the application, inspections, and close-out." },
  { category: "faqs", doc_type: "faq", title: "Crew quality?",
    question: "Are these subcontractors or your crews?",
    answer: "Our crews are vetted, certified installers we've worked with for years. A project manager from our team is on-site every day." },
  { category: "faqs", doc_type: "faq", title: "References?",
    question: "Can I see references or recent jobs?",
    answer: "Absolutely — I'll text you our review profile and addresses of recently completed jobs in your neighborhood." },
  { category: "faqs", doc_type: "faq", title: "Estimate validity?",
    question: "How long is the estimate good for?",
    answer: "30 days. Material prices can change, so locking it in sooner protects you." },
  { category: "faqs", doc_type: "faq", title: "Reroof over existing?",
    question: "Can you roof over my existing shingles?",
    answer: "Code allows up to two layers in many areas, but we strongly recommend a tear-off — better warranty, lighter load, and any deck damage gets repaired." },
  { category: "faqs", doc_type: "faq", title: "Ventilation?",
    question: "Do you fix attic ventilation?",
    answer: "Yes — proper intake and ridge ventilation extends roof life and lowers energy bills. We assess on every inspection." },
  { category: "faqs", doc_type: "faq", title: "Commercial?",
    question: "Do you do commercial buildings?",
    answer: "Yes — TPO, EPDM, and modified bitumen for low-slope roofs up to 50,000 sq ft. I'll connect you with our commercial estimator." },
  { category: "faqs", doc_type: "faq", title: "Storm window?",
    question: "How long do I have to file an insurance claim after a storm?",
    answer: "Most carriers give one year from the date of loss, but file as soon as possible — evidence weathers and storms can be hard to prove later." },
  { category: "faqs", doc_type: "faq", title: "Spanish support?",
    question: "¿Hablan español?",
    answer: "Sí, podemos atenderle en español. ¿En qué le puedo ayudar hoy?" },
  { category: "faqs", doc_type: "faq", title: "After hours?",
    question: "What if I call after hours?",
    answer: "I'm here 24/7. For active leaks I'll dispatch our on-call team; otherwise I'll book your inspection for the next available slot." },
  { category: "faqs", doc_type: "faq", title: "What's a square?",
    question: "What's a 'square' in roofing?",
    answer: "A roofing square equals 100 square feet. So a 2,500 sq ft roof is roughly 25 squares." },
];

export const ROOFERS_DEFAULT_HOURS = {
  timezone: "America/New_York",
  weekdays: { start: "07:00", end: "19:00" },
  saturday: { start: "08:00", end: "16:00" },
  sunday: null,
};

export const ROOFERS_DEFAULT_HANDOFF = {
  crm_provider: "jobnimbus",
  lead_email: "",
  lead_sms: "",
  emergency_transfer_number: "",
  hot_lead_transfer_number: "",
  after_hours_voicemail_number: "",
  after_hours_message: "Thanks for calling — our office is currently closed. I'll text you a link to book or page our on-call team if this is an active leak.",
  missed_call_text_back:
    "Hi, this is [BUSINESS NAME]. Sorry we missed you — would a free roof inspection this week help? Reply YES and I'll get one on the calendar. (Reply STOP to opt out.)",
};

export const ROOFERS_DEFAULT_KPI_TARGETS = {
  answer_rate: 98,
  qual_rate: 70,
  book_rate: 55,
  after_hours: 80,
  recovery: 35,
  aht: 300,
  csat: 4.2,
  emergency_fp: 10,
};
