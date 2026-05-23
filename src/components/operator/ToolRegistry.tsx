import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { KAH_TOOLS } from "@/lib/operatorToolRegistry";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ToolRow { id: string; tool_name: string; provider: string; is_enabled: boolean; health_status: string }

export default function ToolRegistry({ deploymentId }: { deploymentId: string }) {
  const [rows, setRows] = useState<Record<string, ToolRow>>({});
  const [testing, setTesting] = useState<string | null>(null);

  const load = async () => {
    const { data } = await (supabase as any).from("operator_tools").select("*").eq("deployment_id", deploymentId);
    const map: Record<string, ToolRow> = {};
    (data ?? []).forEach((r: ToolRow) => { map[r.tool_name] = r; });
    setRows(map);
  };
  useEffect(() => { if (deploymentId) load(); /* eslint-disable-next-line */ }, [deploymentId]);

  const upsert = async (tool_name: string, patch: Partial<ToolRow>) => {
    const existing = rows[tool_name];
    if (existing) {
      await (supabase as any).from("operator_tools").update(patch).eq("id", existing.id);
    } else {
      const defaults = KAH_TOOLS.find(t => t.name === tool_name)!;
      await (supabase as any).from("operator_tools").insert({
        deployment_id: deploymentId, tool_name,
        provider: defaults.providers[0].id, is_enabled: false, ...patch,
      });
    }
    load();
  };

  const test = async (tool_name: string) => {
    setTesting(tool_name);
    try {
      const { data } = await supabase.functions.invoke("operator-tool-call", {
        body: { deployment_id: deploymentId, tool_name, arguments: { address: "123 Test St", to: "+15555550100", amount: 100, transfer_to: "Jake" } },
      });
      if ((data as any)?.ok) {
        toast.success(`${tool_name} OK (${(data as any).provider}${(data as any).stub ? " · stub" : ""})`);
        await (supabase as any).from("operator_tools").update({ health_status: "ok", last_checked_at: new Date().toISOString() }).eq("deployment_id", deploymentId).eq("tool_name", tool_name);
      } else {
        toast.error((data as any)?.error ?? "Tool failed");
      }
    } catch (e: any) { toast.error(e.message); }
    setTesting(null); load();
  };

  const byCategory: Record<string, typeof KAH_TOOLS> = {};
  KAH_TOOLS.forEach(t => { byCategory[t.category] ??= []; byCategory[t.category].push(t); });

  return (
    <div className="space-y-6">
      {Object.entries(byCategory).map(([cat, tools]) => (
        <Card key={cat}>
          <CardHeader><CardTitle className="capitalize">{cat}</CardTitle><CardDescription>{tools.length} tool{tools.length>1?"s":""}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {tools.map(t => {
              const row = rows[t.name];
              const Icon = t.icon;
              return (
                <div key={t.name} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border p-3">
                  <div className="flex gap-3"><Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{t.label}</span>
                        <Badge variant="outline" className="text-xs">{t.priority}</Badge>
                        {row?.health_status === "ok" && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                        {row?.health_status === "error" && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select value={row?.provider ?? t.providers[0].id} onValueChange={v => upsert(t.name, { provider: v })}>
                      <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{t.providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}{p.recommended ? " ★" : ""}</SelectItem>)}</SelectContent>
                    </Select>
                    <Switch checked={!!row?.is_enabled} onCheckedChange={v => upsert(t.name, { is_enabled: v })} />
                    <Button size="sm" variant="outline" disabled={testing === t.name} onClick={() => test(t.name)}>Test</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
