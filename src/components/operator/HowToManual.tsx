import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, BookOpen } from "lucide-react";

interface Page { id: string; slug: string; title: string; category: string; body_md: string; sort_order: number; }

const FALLBACK: Page[] = [
  { id: "1", slug: "first-call", category: "getting_started", sort_order: 10, title: "Your first call with Ka'h",
    body_md: "1. Hit **Test calls** and run scenario #1 (a clear retail re-roof inquiry).\n2. Watch the live transcript appear.\n3. Confirm Ka'h booked the inspection on your calendar.\n4. Check the **Calls** tab — the call should now appear with disposition, score, and recording." },
  { id: "2", slug: "knowledge-priority", category: "getting_started", sort_order: 20, title: "How Ka'h chooses what to say",
    body_md: "Ka'h follows three layers in this priority order:\n\n1. **Policies** — never broken. Recording disclosure, deductible compliance, emergency triage.\n2. **Your knowledge base** — your services, pricing ranges, service area, FAQs.\n3. **Sector defaults** — only used when your knowledge base is silent.\n\nThe higher a doc's *priority* number, the more weight it gets when answers conflict." },
  { id: "3", slug: "handoff-rules", category: "ops", sort_order: 30, title: "When Ka'h hands off to a human",
    body_md: "Ka'h transfers a call when:\n- **Emergency** trigger fires (active leak, structural collapse, gas smell)\n- A **hot insurance lead** (score ≥75) wants to speak to your sales lead now\n- The caller explicitly asks for a person three times\n- Voice confidence drops below the guardrail floor\n\nConfigure target numbers in **Handoff & compliance**." },
  { id: "4", slug: "kpis", category: "ops", sort_order: 40, title: "Reading your KPI dashboard",
    body_md: "Four KPIs matter most:\n- **Answer rate** — should stay above 99%.\n- **Book rate** — % of qualified callers who got onto the calendar.\n- **AHT** (avg handle time) — under 3:30 is healthy for roofing.\n- **Emergency response time** — from ring to dispatcher answer, target <90s." },
  { id: "5", slug: "compliance", category: "compliance", sort_order: 50, title: "Staying compliant on every call",
    body_md: "Ka'h enforces these automatically:\n- TCPA recording disclosure within 5 seconds (EN + ES).\n- DNC scrub on any outbound. Inbound is not subject to DNC.\n- Never offers to waive, absorb, or 'eat' the deductible.\n- Logs every disclosure + caller acknowledgment in **Audit log**." },
  { id: "6", slug: "billing", category: "billing", sort_order: 60, title: "Understanding your bill",
    body_md: "Your monthly subscription includes a capped number of *answered* calls. Missed calls don't count. Overages bill at $0.18/answered call. SMS text-back bills at $0.04/message. You can see live usage in **Billing & usage**." },
];

export default function HowToManual({ sectorSlug }: { sectorSlug: string }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("kah_manual_pages")
        .select("*")
        .or(`sector_slug.is.null,sector_slug.eq.${sectorSlug}`)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      setPages(data?.length ? (data as Page[]) : FALLBACK);
      setLoading(false);
    })();
  }, [sectorSlug]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin mx-auto my-12" />;

  const cats = Array.from(new Set(pages.map(p => p.category)));
  const labels: Record<string, string> = {
    getting_started: "Getting started", ops: "Operations", compliance: "Compliance & safety", billing: "Billing & usage",
  };

  return (
    <div className="space-y-4">
      {cats.map(cat => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4" />{labels[cat] ?? cat}</CardTitle>
            <CardDescription>{pages.filter(p => p.category === cat).length} guides</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple">
              {pages.filter(p => p.category === cat).map(p => (
                <AccordionItem key={p.id} value={p.id}>
                  <AccordionTrigger className="text-left">{p.title}</AccordionTrigger>
                  <AccordionContent>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{p.body_md}</pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
