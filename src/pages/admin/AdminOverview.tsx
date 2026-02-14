import { AdminLayout } from "@/pages/Admin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, Activity, Server, Image, Video, Send, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function StatCard({ title, value, change, icon: Icon, iconColor = "text-primary" }: { title: string; value: string | number; change?: number; icon: React.ElementType; iconColor?: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-display mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {change >= 0 ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                <span className={change >= 0 ? "text-primary text-sm" : "text-destructive text-sm"}>{change >= 0 ? "+" : ""}{change}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-muted ${iconColor}`}><Icon className="w-6 h-6" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOverview() {
  const { data: userCount } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  const { data: orgCount } = useQuery({
    queryKey: ["admin-org-count"],
    queryFn: async () => {
      const { count } = await supabase.from("organizations").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const services = [
    { name: "API Gateway", status: "operational", uptime: 99.98, latency: 45 },
    { name: "Database", status: "operational", uptime: 99.99, latency: 12 },
    { name: "AI Gateway", status: "operational", uptime: 99.95, latency: 230 },
    { name: "Storage", status: "operational", uptime: 99.99, latency: 8 },
    { name: "Auth Service", status: "operational", uptime: 100, latency: 15 },
  ];

  return (
    <AdminLayout title="Admin Console" description="Platform health and metrics at a glance.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={userCount ?? "—"} change={12} icon={Users} />
        <StatCard title="Organizations" value={orgCount ?? "—"} change={8} icon={Building2} />
        <StatCard title="MRR" value="$0" change={0} icon={DollarSign} iconColor="text-gold-500" />
        <StatCard title="AI Credits Used" value="0" change={0} icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-sm font-display">Platform Generation Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[{ label: "Images Generated", value: "0", icon: Image }, { label: "Videos Created", value: "0", icon: Video }, { label: "Posts Scheduled", value: "0", icon: Send }].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><s.icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{s.label}</span></div>
                  <span className="font-mono text-sm font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display">Service Status</CardTitle>
              <Button variant="ghost" size="sm"><RefreshCw className="h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.status === "operational" ? "bg-primary" : "bg-destructive"}`} />
                    <span className="text-sm">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{s.latency}ms</span>
                    <Badge variant="secondary" className="text-[10px]">{s.uptime}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
