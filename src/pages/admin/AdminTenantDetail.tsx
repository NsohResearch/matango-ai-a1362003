import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/pages/Admin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Building2, CreditCard, Activity, Settings, Shield, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { id: "overview", name: "Overview", icon: Building2 },
  { id: "billing", name: "Billing", icon: CreditCard },
  { id: "usage", name: "Usage & Limits", icon: Activity },
  { id: "entitlements", name: "Entitlements", icon: Settings },
  { id: "security", name: "Security", icon: Shield },
  { id: "audit", name: "Audit Log", icon: Clock },
];

export default function AdminTenantDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: org, isLoading } = useQuery({
    queryKey: ["admin-tenant", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["admin-tenant-members", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("memberships").select("*, profiles(name, email)").eq("organization_id", id!);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <AdminLayout title="Loading..." description=""><div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title={org?.name || "Tenant"} description={`Slug: ${org?.slug || "—"} · Plan: ${org?.plan || "—"}`}>
      <Link to="/admin/tenants" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Tenants
      </Link>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {tabs.map((t) => <TabsTrigger key={t.id} value={t.id} className="gap-1.5"><t.icon className="h-3.5 w-3.5" />{t.name}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Organization Info</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{org?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><Badge>{org?.plan}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Max Brands</span><span>{org?.max_brands}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Assets Limit</span><span>{org?.assets_limit}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{org?.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}</span></div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle className="text-sm">Members ({members?.length || 0})</CardTitle></CardHeader><CardContent>
              {members?.length ? members.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{m.user_id.substring(0, 8)}...</span>
                  <Badge variant="secondary" className="text-[10px]">{m.role}</Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground">No members.</p>}
            </CardContent></Card>
          </div>
        </TabsContent>

        {["billing", "usage", "entitlements", "security", "audit"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Detailed {tab} data will populate as the platform grows.</p></CardContent></Card>
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
}
