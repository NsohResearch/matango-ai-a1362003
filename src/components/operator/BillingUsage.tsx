import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { KAH_TIERS, KAH_OVERAGES } from "@/config/kahTiers";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BillingUsage({ deploymentId }: { deploymentId: string }) {
  const [usage, setUsage] = useState<{ calls: number; sms: number }>({ calls: 0, sms: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState<string>("pilot");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
      const { count: calls } = await supabase
        .from("operator_call_logs")
        .select("id", { count: "exact", head: true })
        .eq("deployment_id", deploymentId)
        .gte("started_at", startOfMonth.toISOString());
      const { count: sms } = await supabase
        .from("operator_call_logs")
        .select("id", { count: "exact", head: true })
        .eq("deployment_id", deploymentId)
        .eq("channel", "sms")
        .gte("started_at", startOfMonth.toISOString());
      setUsage({ calls: calls ?? 0, sms: sms ?? 0 });
      setLoading(false);
    })();
  }, [deploymentId]);

  const tier = KAH_TIERS.find(t => t.id === activeTier) ?? KAH_TIERS[0];
  const cap = tier.id === "pilot" ? 100 : tier.id === "solo" ? 500 : tier.id === "crew" ? 2000 : tier.id === "fleet" ? 7500 : Infinity;
  const pct = Math.min(100, (usage.calls / cap) * 100);

  const openCheckout = async (priceId?: string, id?: string) => {
    if (!priceId) return;
    setBusy(id ?? null);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { priceId, mode: "subscription" } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to open checkout");
    } finally { setBusy(null); }
  };

  const openPortal = async () => {
    setBusy("portal");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) { toast.error(e.message ?? "Portal unavailable"); } finally { setBusy(null); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>This billing cycle</CardTitle>
          <CardDescription>Resets at the start of each month.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Answered calls</span>
              <span className="text-muted-foreground">{usage.calls} / {cap === Infinity ? "∞" : cap}</span>
            </div>
            <Progress value={pct} />
          </div>
          <div className="text-sm flex justify-between"><span>SMS messages</span><span className="text-muted-foreground">{usage.sms}</span></div>
          {pct >= 80 && pct < 100 && <p className="text-xs text-amber-600">You're at {Math.round(pct)}% of your plan — consider upgrading to avoid overage charges.</p>}
          {pct >= 100 && <p className="text-xs text-destructive">Plan exceeded — overages now apply at {KAH_OVERAGES[0].price}/call.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Manage subscription, payment method, and invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{tier.name}</p>
              <p className="text-sm text-muted-foreground">{tier.tagline}</p>
            </div>
            <Badge>{tier.id === "pilot" ? "Free" : `$${tier.price}/mo`}</Badge>
          </div>
          <Button size="sm" variant="outline" disabled={busy === "portal"} onClick={openPortal}>
            {busy === "portal" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            Manage subscription & invoices
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade or change plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {KAH_TIERS.filter(t => t.priceId).map(t => (
              <div key={t.id} className={`rounded border p-3 ${t.highlight ? "border-primary" : ""}`}>
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm">${t.price}<span className="text-xs text-muted-foreground">/mo</span></p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.calls}</p>
                <Button
                  size="sm" className="w-full mt-2" variant={t.highlight ? "default" : "outline"}
                  disabled={busy === t.id}
                  onClick={() => { setActiveTier(t.id); openCheckout(t.priceId, t.id); }}
                >
                  {busy === t.id && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Choose {t.name}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
