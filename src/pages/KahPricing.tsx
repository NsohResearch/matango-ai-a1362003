import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Phone, MessageSquare, PhoneForwarded, Loader2 } from "lucide-react";
import { KAH_TIERS, KAH_OVERAGES } from "@/config/kahTiers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export default function KahPricing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (priceId?: string, tierId?: string) => {
    if (!priceId) {
      if (tierId === "enterprise") { window.location.href = "/contact?type=kah_enterprise"; return; }
      if (tierId === "pilot") {
        window.location.href = user ? "/operators/kah/roofers" : "/auth?mode=signup&intent=kah_pilot";
        return;
      }
      return;
    }
    if (!user) { window.location.href = `/auth?mode=signup&intent=kah_${tierId}`; return; }
    setLoading(tierId ?? priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, mode: "subscription" },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message ?? "Checkout failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <header className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3">Ka'h Receptionist</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Pricing for your 24/7 AI receptionist</h1>
          <p className="text-muted-foreground mt-3">
            Per location, billed monthly. Unlimited inbound minutes, English + Spanish, recording archive, missed-call text-back, and the 10-scenario test harness included on every tier.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {KAH_TIERS.map(t => (
            <Card key={t.id} className={t.highlight ? "border-primary shadow-lg relative" : ""}>
              {t.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t.name}</span>
                </CardTitle>
                <CardDescription>{t.tagline}</CardDescription>
                <div className="pt-2">
                  {t.id === "enterprise" ? (
                    <span className="text-2xl font-semibold">Custom</span>
                  ) : t.price === 0 ? (
                    <span className="text-2xl font-semibold">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-semibold">${t.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground"> /mo</span>
                    </>
                  )}
                  {t.setupFee ? (
                    <p className="text-xs text-muted-foreground mt-1">+ ${t.setupFee.toLocaleString()} one-time setup</p>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1.5">
                  <p className="flex items-center gap-2"><Phone className="h-3 w-3" />{t.numbers}</p>
                  <p className="flex items-center gap-2"><MessageSquare className="h-3 w-3" />{t.calls}</p>
                  <p className="flex items-center gap-2"><PhoneForwarded className="h-3 w-3" />{t.builtFor}</p>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {t.features.map(f => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{f}</span></li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={t.highlight ? "default" : "outline"}
                  disabled={loading === t.id}
                  onClick={() => checkout(t.priceId, t.id)}
                >
                  {loading === t.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {t.id === "pilot" ? "Start free pilot" :
                    t.id === "enterprise" ? "Contact sales" :
                    `Choose ${t.name}`}
                </Button>
                {t.notes && <p className="text-[11px] text-muted-foreground">{t.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Overage rates (all tiers)</CardTitle>
            <CardDescription>Beyond the included cap on your plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {KAH_OVERAGES.map(o => (
                <li key={o.label} className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-semibold">{o.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{o.label}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Crew tier prices in at roughly $0.35 per answered call — well below the $2.50–$8 traditional answering services charge — while delivering 24/7 bilingual coverage.
              Roofing first. HVAC, solar, plumbing, electrical, and pest sectors mirror this structure with sector-specific knowledge packs.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-10">
          <Link to="/operators/kah/roofers"><Button variant="ghost">See Ka'h's roofing dashboard →</Button></Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
