import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Search, Download, Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

const stageColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  qualified: "bg-primary/20 text-primary",
  converted: "bg-green-500/20 text-green-400",
  lost: "bg-muted text-muted-foreground",
};

export default function AdminLeads() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = leads?.filter((l) => l.name?.toLowerCase().includes(searchQuery.toLowerCase()) || l.email?.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <AdminLayout title="Platform Leads" description="Global lead management.">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No leads recorded yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted"><User className="h-4 w-4 text-muted-foreground" /></div>
                  <div>
                    <h3 className="text-sm font-medium">{lead.name || "Unknown"}</h3>
                    <p className="text-xs text-muted-foreground">{lead.email || "—"}{lead.company ? ` · ${lead.company}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={stageColors[lead.stage] || stageColors.new}>{lead.stage}</Badge>
                  {lead.source && <Badge variant="secondary" className="text-[10px]">{lead.source}</Badge>}
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
