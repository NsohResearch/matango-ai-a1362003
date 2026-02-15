import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What counts as an AI generation?", a: "Any structured AI output including copy, scripts, or creative assets." },
  { q: "What is a Brand Brain?", a: "A persistent brand memory containing ICP, voice, and campaign intelligence." },
  { q: "What are AAOs?", a: "AI-Amplified Operators — role-based agents executing defined marketing workflows." },
  { q: "Does Basic include Video Studio?", a: "Yes. Video Studio is included. Video Studio Pro is Agency and above." },
  { q: "What does white label include?", a: "Removal of Matango branding and custom brand presentation." },
  { q: "Can I upgrade or downgrade anytime?", a: "Yes. Plan changes take effect at the next billing cycle." },
  { q: "Is there an API?", a: "API access is included in Agency and Agency++." },
  { q: "Do you offer enterprise security options?", a: "Agency++ includes SLA and optional on-premise deployment." },
];

const PricingFAQ = () => (
  <div className="mt-16 max-w-3xl mx-auto">
    <h2 className="font-display text-2xl font-semibold text-center text-foreground mb-8">Frequently Asked Questions</h2>
    <Accordion type="single" collapsible className="space-y-2">
      {faqs.map((f, i) => (
        <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">{f.q}</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default PricingFAQ;
