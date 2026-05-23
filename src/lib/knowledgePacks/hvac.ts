// HVAC starter knowledge pack — sector-adapted from the roofing template.
// Key adaptations: no-heat/no-cool urgency, refrigerant/EPA compliance,
// maintenance contracts, system replacement seasonality, indoor air quality upsell.

import type { SeedDoc } from "./roofers";

export const HVAC_PACK: SeedDoc[] = [
  // ── Identity ──
  { category: "identity", doc_type: "document", title: "Company identity (TEMPLATE)",
    content: "Legal name: [FILL IN]\nDBA: [FILL IN]\nYear founded: [YYYY]\nOwner / GM: [NAME]\nLicense #s: HVAC contractor [STATE-LIC], EPA 608 Universal certified\nInsurance: General Liability [POLICY], Workers Comp [POLICY]\nNATE-certified technicians: [yes/no]\nBrand voice: trustworthy neighbor, never alarmist, never high-pressure.",
    tags: ["identity", "template"], priority: 100 },
  { category: "team", doc_type: "document", title: "Routing matrix (TEMPLATE)",
    content: "No heat (winter) / no cool (summer) emergency → On-call dispatcher [+1...]\nSystem replacement / sales lead → Comfort Advisor [NAME / +1...]\nMaintenance plan inquiry → Service Coordinator [+1...]\nWarranty / parts → Service Manager [+1...]\nCommercial / light commercial → Commercial Lead [+1...]\nAfter-hours overflow → SMS text-back + voicemail",
    tags: ["team", "routing", "template"], priority: 95 },

  // ── Services & pricing baseline ──
  { category: "services_pricing", doc_type: "document", title: "Standard services catalog",
    content: "• A/C and heat-pump install, repair, and tune-up\n• Furnace / boiler install, repair, and tune-up (gas, electric, oil)\n• Mini-split / ductless install\n• Ductwork install, repair, sealing, and replacement\n• Indoor air quality: HEPA, UV, humidifiers, dehumidifiers\n• Thermostat & smart-home install (Nest, Ecobee, Honeywell)\n• Refrigerant recharge (R-410A, R-454B; R-22 retrofit consults)\n• Annual maintenance plans (1 or 2 visits/yr)\n• Commercial RTU service",
    tags: ["services", "catalog"], priority: 90 },
  { category: "services_pricing", doc_type: "document", title: "Pricing ranges (do not quote firm prices on call)",
    content: "Ranges only — Ka'h must never quote firm pricing without an in-home load calc.\n• Diagnostic fee: $89–$149 (often waived if repair authorized)\n• A/C tune-up: $99–$179\n• Capacitor / contactor: $200–$450\n• Refrigerant per lb (R-410A): $90–$180\n• Furnace repair: $300–$1,800 typical\n• Single-system replacement (3-ton, 14-SEER2): $6,500–$10,500\n• High-efficiency heat pump (16-SEER2+): $9,500–$18,000\nFinancing: 0% 18-mo, 6.99% 84-mo (subject to credit). Manufacturer rebates per quarter.",
    tags: ["pricing"], priority: 88 },

  // ── Service area placeholder ──
  { category: "service_area", doc_type: "document", title: "Service area (TEMPLATE)",
    content: "Primary ZIPs: [LIST]\nSecondary ZIPs (after-hours trip fee +$95): [LIST]\nMax radius from shop: [N] miles\nCommercial coverage: [LIST]\nKa'h must run check_service_area on every address before booking.",
    tags: ["service-area", "template"], priority: 92 },

  // ── Compliance ──
  { category: "compliance", doc_type: "document", title: "EPA & refrigerant compliance",
    content: "1. Only EPA 608-certified techs handle refrigerant. Never confirm a recharge over the phone without diagnostic.\n2. Do not quote R-22 recharge prices — phased out; recommend retrofit or replacement consult.\n3. Federal tax credits (Inflation Reduction Act): up to $2,000 for heat pumps, $1,200 misc — confirm current year before promising.\n4. Manufacturer warranty registration required within 60–90 days of install.\n5. Combustion safety check required on every furnace install (carbon monoxide).",
    tags: ["epa", "compliance"], priority: 95 },
  { category: "compliance", doc_type: "policy", title: "Emergency-call disclosure (EN)",
    content: "If caller reports no heat with indoor temp <50°F, vulnerable resident (elderly/infant/medical), CO alarm, gas smell, or smoke — flag emergency, dispatch immediately, and offer to stay on the line.",
    tags: ["emergency", "safety"], priority: 100 },
  { category: "compliance", doc_type: "policy", title: "Recording disclosure (EN)",
    content: "Within 5 seconds of answer: 'This call may be recorded for quality and training. By staying on the line you consent. Press 9 to opt out.'",
    tags: ["tcpa", "recording"], priority: 100 },
  { category: "compliance", doc_type: "policy", title: "Recording disclosure (ES)",
    content: "En los primeros 5 segundos: 'Esta llamada puede ser grabada con fines de calidad y capacitación. Al permanecer en la línea, usted consiente. Marque 9 para no ser grabado.'",
    tags: ["tcpa", "es"], priority: 100 },

  // ── FAQs ──
  { category: "faq", doc_type: "faq", title: "My AC isn't cooling — is it an emergency?", question: "My AC isn't cooling — is it an emergency?",
    answer: "If indoor temp is above 85°F, anyone in the home has a medical condition, or there's an infant or elderly resident, we treat it as priority and dispatch same-day. Otherwise we book the next available slot, usually within 24 hours.",
    tags: ["emergency", "ac"], priority: 90 },
  { category: "faq", doc_type: "faq", title: "How much is a new AC system?", question: "How much is a new AC system?",
    answer: "Replacement depends on home size, ductwork, and efficiency rating — typical 3-ton 14-SEER2 systems run $6,500–$10,500 installed, high-efficiency heat pumps $9,500–$18,000. We'll send a Comfort Advisor for a no-charge in-home load calc and firm quote.",
    tags: ["pricing", "replacement"] },
  { category: "faq", doc_type: "faq", title: "Do you offer financing?", question: "Do you offer financing?",
    answer: "Yes — 0% APR for 18 months or 6.99% for up to 84 months, subject to credit approval through our financing partner. We can pre-qualify in about 90 seconds during the visit.",
    tags: ["financing"] },
  { category: "faq", doc_type: "faq", title: "Are there rebates or tax credits?", question: "Are there rebates or tax credits?",
    answer: "Heat pumps may qualify for up to $2,000 federal tax credit, plus utility rebates that vary by ZIP. The Comfort Advisor brings the current rebate sheet for your area.",
    tags: ["rebates"] },
  { category: "faq", doc_type: "faq", title: "How often should I service my system?", question: "How often should I service my system?",
    answer: "Twice a year — heating tune-up in fall, cooling tune-up in spring. Our maintenance plan bundles both, plus priority dispatch and parts discounts.",
    tags: ["maintenance"] },
  { category: "faq", doc_type: "faq", title: "Do you work on commercial buildings?", question: "Do you work on commercial buildings?",
    answer: "Yes, light commercial up to 25-ton RTUs. For larger plants we'll refer to our commercial partner.",
    tags: ["commercial"] },
  { category: "faq", doc_type: "faq", title: "Can you recharge my R-22 system?", question: "Can you recharge my R-22 system?",
    answer: "R-22 has been phased out, so refrigerant is scarce and expensive. We'll do a diagnostic and discuss whether a retrofit or replacement makes more financial sense.",
    tags: ["r22", "refrigerant"] },
  { category: "faq", doc_type: "faq", title: "What's a SEER2 rating?", question: "What's a SEER2 rating?",
    answer: "SEER2 is the updated efficiency rating starting in 2023. Minimums vary by region — 14.3 SEER2 in the north, 15.2 SEER2 in the south. Higher numbers mean lower utility bills.",
    tags: ["efficiency"] },
  { category: "faq", doc_type: "faq", title: "Do you install smart thermostats?", question: "Do you install smart thermostats?",
    answer: "Yes — Nest, Ecobee, and Honeywell models. Install runs about $200–$350 including configuration with your Wi-Fi and our system.",
    tags: ["thermostat"] },
  { category: "faq", doc_type: "faq", title: "How fast can you come out?", question: "How fast can you come out?",
    answer: "Same-day for no-heat or no-cool emergencies, next-day for non-urgent diagnostics, and within a week for replacement consults. I can check live availability right now.",
    tags: ["scheduling"] },
];
