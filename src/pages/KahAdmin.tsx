import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Activity, Users, Package, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function KahAdmin() {
  const [tab, setTab] = useState("tenants");
  const [tenants, setTenants] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [t, h, p, a] = await Promise.all([
        supabase.from("operator_deployments").select("id,display_name,operator_slug,industry_slug,status,phone_number,created_at,user_id").eq("operator_slug", "kah").order("created_at", { ascending: false }),
        supabase.from("operator_provider_health").select("*").order("checked_at", { ascending: false }).limit(20),
        supabase.from("sector_packs").select("*").order("name"),
        supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setTenants(t.data ?? []); setHealth(h.data ?? []); setPacks(p.data ?? []); setAudit(a.data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div></DashboardLayout>;

  const providers = ["retell", "twilio", "google_calendar", "jobnimbus", "google_maps"];
  const latestHealth = (prov: string) => health.find(h => h.provider === prov);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Ka'h Admin Console</h1>
        <p className="text-sm text-muted-foreground">Matango staff view — all deployments, integrations, and compliance.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="tenants"><Users className="h-3 w-3 mr-1" />Tenants</TabsTrigger>
          <TabsTrigger value="health"><Activity className="h-3 w-3 mr-1" />Provider health</TabsTrigger>
          <TabsTrigger value="packs"><Package className="h-3 w-3 mr-1" />Sector packs</TabsTrigger>
          <TabsTrigger value="audit"><Shield className="h-3 w-3 mr-1" />Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployments ({tenants.length})</CardTitle>
              <CardDescription>Every Ka'h deployment across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {tenants.length === 0 ? <p className="text-sm text-muted-foreground">No deployments yet.</p> :
                  tenants.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded border text-sm">
                      <div>
                        <p className="font-medium">{t.display_name}</p>
                        <p className="text-xs text-muted-foreground">{t.industry_slug} · {t.phone_number ?? "no number"} · created {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</p>
                      </div>
                      <Badge variant={t.status === "live" ? "default" : "outline"}>{t.status}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {providers.map(p => {
              const h = latestHealth(p);
              const status = h?.status ?? "unknown";
              const color = status === "healthy" ? "default" : status === "degraded" ? "secondary" : status === "down" ? "destructive" : "outline";
              return (
                <Card key={p}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      {p}
                      <Badge variant={color as any}>{status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {h ? (
                      <>
                        <p>Latency: {h.latency_ms ?? "—"}ms</p>
                        <p>Checked: {formatDistanceToNow(new Date(h.checked_at), { addSuffix: true })}</p>
                        {h.message && <p className="mt-1">{h.message}</p>}
                      </>
                    ) : <p>No health data yet. Run a ping job.</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="packs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sector starter packs</CardTitle>
              <CardDescription>Curate the knowledge bundles tenants load with one click.</CardDescription>
            </CardHeader>
            <CardContent>
              {packs.length === 0 ? (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>No packs registered in the database yet. The roofing and HVAC packs currently live in code at <code>src/lib/knowledgePacks/</code>.</p>
                  <p>Migrating them to the <code>sector_packs</code> table is a one-line script — say the word.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {packs.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.slug} · v{p.version}</p>
                      </div>
                      <Badge variant={p.is_published ? "default" : "outline"}>{p.is_published ? "published" : "draft"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Recent admin actions</CardTitle></CardHeader>
            <CardContent>
              {audit.length === 0 ? <p className="text-sm text-muted-foreground">No admin events recorded.</p> :
                <div className="space-y-1.5">
                  {audit.map(a => (
                    <div key={a.id} className="text-sm border rounded p-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{a.action}</span>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                      </div>
                      {a.target_type && <p className="text-xs text-muted-foreground">{a.target_type}: {a.target_id}</p>}
                    </div>
                  ))}
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
