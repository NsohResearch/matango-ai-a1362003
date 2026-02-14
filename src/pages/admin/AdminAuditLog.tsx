import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

export default function AdminAuditLog() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["admin-audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = entries?.filter((e) => e.action.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <AdminLayout title="Audit Log" description="View system audit trail.">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search actions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No audit events recorded yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.target_type && <span>{entry.target_type} · </span>}
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{entry.admin_id.substring(0, 8)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
