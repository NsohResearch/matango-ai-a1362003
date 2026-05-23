import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { KAH_TEST_SCENARIOS } from "@/lib/operatorToolRegistry";
import { CheckCircle2, XCircle, Play, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Run { id: string; scenario_id: string; status: string; transcript: string | null; notes: string | null; score: number | null; ran_at: string | null }

export default function TestScenarios({ deploymentId }: { deploymentId: string }) {
  const { user } = useAuth();
  const [runs, setRuns] = useState<Record<string, Run>>({});
  const [active, setActive] = useState<string | null>(null);

  const load = async () => {
    const { data } = await (supabase as any).from("operator_test_runs")
      .select("*").eq("deployment_id", deploymentId).order("ran_at", { ascending: false });
    const map: Record<string, Run> = {};
    for (const r of (data ?? []) as Run[]) if (!map[r.scenario_id]) map[r.scenario_id] = r;
    setRuns(map);
  };
  useEffect(() => { if (deploymentId) load(); /* eslint-disable-next-line */ }, [deploymentId]);

  const setStatus = async (scenario: typeof KAH_TEST_SCENARIOS[number], status: "pass" | "fail" | "pending", patch: Partial<Run> = {}) => {
    if (!user) return;
    const existing = runs[scenario.id];
    if (existing) {
      await (supabase as any).from("operator_test_runs").update({
        status, ran_at: new Date().toISOString(), ...patch,
      }).eq("id", existing.id);
    } else {
      await (supabase as any).from("operator_test_runs").insert({
        deployment_id: deploymentId, user_id: user.id, scenario_id: scenario.id,
        scenario_label: scenario.label, status, ran_at: new Date().toISOString(), ...patch,
      });
    }
    load();
  };

  const passes = Object.values(runs).filter(r => r.status === "pass").length;
  const pct = Math.round((passes / KAH_TEST_SCENARIOS.length) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test calls</CardTitle>
              <CardDescription>10 scripted scenarios that must all pass before Ka'h goes live.</CardDescription>
            </div>
            <Badge variant={pct === 100 ? "default" : "outline"}>{passes}/{KAH_TEST_SCENARIOS.length} passed</Badge>
          </div>
        </CardHeader>
        <CardContent><Progress value={pct} /></CardContent>
      </Card>

      <div className="space-y-2">
        {KAH_TEST_SCENARIOS.map(s => {
          const run = runs[s.id];
          const isActive = active === s.id;
          return (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-2 min-w-0">
                    {run?.status === "pass" && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />}
                    {run?.status === "fail" && <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />}
                    {!run && <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{s.label}</span>
                        <Badge variant="outline" className="text-xs uppercase">{s.language}</Badge>
                        <Badge variant="secondary" className="text-xs">{s.category.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.prompt}</p>
                      {s.expects.length > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Expected tools: <span className="font-mono">{s.expects.join(" → ")}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Select value={run?.status ?? "pending"} onValueChange={(v: any) => setStatus(s, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => setActive(isActive ? null : s.id)}>
                      {isActive ? "Close" : <><Play className="h-3 w-3 mr-1" /> Run</>}
                    </Button>
                  </div>
                </div>
                {isActive && (
                  <div className="mt-2 space-y-2 rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">
                      Open the <strong>Voice</strong> tab → <strong>Start web test call</strong> and read this prompt to Ka'h. Then paste transcript/notes below and mark Pass or Fail.
                    </p>
                    <Textarea rows={4} placeholder="Transcript or summary" defaultValue={run?.transcript ?? ""}
                      onBlur={e => setStatus(s, (run?.status as any) ?? "pending", { transcript: e.target.value })} />
                    <Textarea rows={2} placeholder="Notes (e.g. tools fired, latency, issues)" defaultValue={run?.notes ?? ""}
                      onBlur={e => setStatus(s, (run?.status as any) ?? "pending", { notes: e.target.value })} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { setStatus(s, "pass"); toast.success("Marked pass"); }}>Mark pass</Button>
                      <Button size="sm" variant="destructive" onClick={() => { setStatus(s, "fail"); toast.error("Marked fail"); }}>Mark fail</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
