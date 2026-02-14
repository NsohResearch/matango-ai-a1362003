import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Flag, Plus, Search, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function AdminFeatureFlags() {
  const [searchQuery, setSearchQuery] = useState("");
  const qc = useQueryClient();

  const { data: flags, isLoading } = useQuery({
    queryKey: ["admin-feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feature_flags").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase.from("feature_flags").update({ is_enabled, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-feature-flags"] }); toast.success("Flag updated"); },
  });

  const filtered = flags?.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <AdminLayout title="Feature Flags" description="Control feature availability across the platform.">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search flags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Flag className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No feature flags configured yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((flag) => (
            <Card key={flag.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{flag.name}</h3>
                    <Badge variant="secondary" className="text-[10px] font-mono">{flag.name.toLowerCase().replace(/\s+/g, "_")}</Badge>
                  </div>
                  {flag.description && <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>}
                </div>
                <Switch checked={flag.is_enabled} onCheckedChange={(v) => toggleFlag.mutate({ id: flag.id, is_enabled: v })} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
