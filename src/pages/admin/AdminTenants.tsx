import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search, Building2, Eye, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const planColors: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  basic: "bg-blue-500/20 text-blue-400",
  agency: "bg-purple-500/20 text-purple-400",
  agency_plus: "bg-primary/20 text-primary",
};

export default function AdminTenants() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("*, memberships(count)").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = orgs?.filter((o) => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.slug.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <AdminLayout title="Tenants" description="Manage platform organizations and users.">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search organizations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No tenants found.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((org) => (
            <Card key={org.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-medium text-sm">{org.name}</h3>
                    <p className="text-xs text-muted-foreground">{org.slug} · Owner: {org.owner_id.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={planColors[org.plan] || planColors.free}>{org.plan}</Badge>
                  <span className="text-xs text-muted-foreground">{org.max_brands} brands</span>
                  <Link to={`/admin/tenants/${org.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
