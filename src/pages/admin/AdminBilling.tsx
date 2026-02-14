import { useState, useEffect } from "react";
import { AdminLayout } from "@/pages/Admin";
import { DollarSign, TrendingUp, CreditCard, Users, Search, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  active: "bg-primary/20 text-primary",
  trialing: "bg-blue-500/20 text-blue-400",
  past_due: "bg-destructive/20 text-destructive",
  canceled: "bg-muted text-muted-foreground",
  free: "bg-secondary text-muted-foreground",
};

export default function AdminBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setProfiles(data || []);
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  const filtered = profiles.filter(p =>
    !searchQuery ||
    (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.plan || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const planCounts = profiles.reduce((acc, p) => {
    acc[p.plan || "free"] = (acc[p.plan || "free"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const basicCount = planCounts["basic"] || 0;
  const agencyCount = planCounts["agency"] || 0;
  const mrr = basicCount * 199 + agencyCount * 399;

  return (
    <AdminLayout title="Billing" description="Manage subscriptions and revenue.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">MRR</p><p className="text-2xl font-bold font-display">${mrr.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">ARR</p><p className="text-2xl font-bold font-display">${(mrr * 12).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Paid Users</p><p className="text-2xl font-bold font-display">{basicCount + agencyCount}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold font-display">{profiles.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display">User Subscriptions</CardTitle>
            <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or plan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-8 w-8 mx-auto mb-2" />
              <p>No users found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {(p.name || p.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name || p.email || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[p.plan || "free"]}>{p.plan || "free"}</Badge>
                    <span className="text-xs text-muted-foreground">{p.credits} credits</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
