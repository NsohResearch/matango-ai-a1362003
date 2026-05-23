import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Lead {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  stage: string;
  source: string | null;
  notes: string | null;
  created_at: string;
}

const STAGES = [
  { key: "emergency", label: "Emergency", color: "bg-destructive/10 border-destructive/40" },
  { key: "hot", label: "Hot", color: "bg-amber-500/10 border-amber-500/40" },
  { key: "warm", label: "Warm", color: "bg-blue-500/10 border-blue-500/40" },
  { key: "nurture", label: "Nurture", color: "bg-muted border-border" },
] as const;

export default function LeadPipeline({ deploymentSlug }: { deploymentSlug: string }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .like("source", `kah_${deploymentSlug}%`)
        .order("created_at", { ascending: false });
      setLeads((data as Lead[]) ?? []);
      setLoading(false);
    })();
  }, [user, deploymentSlug]);

  const move = async (id: string, stage: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    await supabase.from("leads").update({ stage }).eq("id", id);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {STAGES.map(s => {
        const items = leads.filter(l => l.stage === s.key);
        return (
          <Card key={s.key} className={s.color}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{s.label}</span>
                <Badge variant="outline">{items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[200px]">
              {items.length === 0 && <p className="text-xs text-muted-foreground italic">Empty</p>}
              {items.map(l => (
                <div key={l.id} className="rounded border bg-background p-2 text-xs">
                  <p className="font-medium">{l.name ?? "Anonymous"}</p>
                  {l.company && <p className="text-muted-foreground">{l.company}</p>}
                  {l.notes && <p className="text-muted-foreground mt-1 line-clamp-2">{l.notes}</p>}
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {STAGES.filter(x => x.key !== s.key).map(x => (
                      <Button key={x.key} size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => move(l.id, x.key)}>→ {x.label}</Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
