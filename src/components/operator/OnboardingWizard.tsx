import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ONBOARDING_PHASES } from "@/lib/operatorToolRegistry";
import { supabase } from "@/integrations/supabase/client";

export default function OnboardingWizard({ deploymentId, progress }: {
  deploymentId: string;
  progress: { phase: number; completed_steps: string[] };
}) {
  const [completed, setCompleted] = useState<string[]>(progress?.completed_steps ?? []);
  useEffect(() => { setCompleted(progress?.completed_steps ?? []); }, [progress]);

  const toggle = async (step: string) => {
    const next = completed.includes(step) ? completed.filter(s => s !== step) : [...completed, step];
    setCompleted(next);
    const phase = ONBOARDING_PHASES.find(p => p.steps.every(s => next.includes(`${p.phase}:${s}`)))?.phase ?? progress?.phase ?? 1;
    await (supabase as any).from("operator_deployments").update({
      onboarding_progress: { phase: Math.max(progress?.phase ?? 1, phase), completed_steps: next },
    }).eq("id", deploymentId);
  };

  const total = ONBOARDING_PHASES.reduce((n, p) => n + p.steps.length, 0);
  const done = completed.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between"><CardTitle>Overall progress</CardTitle><Badge>{done}/{total}</Badge></div>
          <CardDescription>Ka'h goes live once every phase is checked.</CardDescription>
        </CardHeader>
        <CardContent><Progress value={pct} /></CardContent>
      </Card>

      {ONBOARDING_PHASES.map(p => (
        <Card key={p.phase}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Phase {p.phase}: {p.title}</CardTitle>
              <Badge variant="outline">Days {p.days}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.steps.map(step => {
              const key = `${p.phase}:${step}`;
              const checked = completed.includes(key);
              return (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <Checkbox checked={checked} onCheckedChange={() => toggle(key)} />
                  <span className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>{step}</span>
                </label>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
