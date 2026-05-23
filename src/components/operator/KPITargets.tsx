import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROOFERS_DEFAULT_KPI_TARGETS } from "@/lib/knowledgePacks/roofers";
import { Loader2, Target } from "lucide-react";
import { toast } from "sonner";

const FIELDS = [
  { key: "answer_rate", label: "Answer rate %", suffix: "%" },
  { key: "qual_rate", label: "Qualification rate %", suffix: "%" },
  { key: "book_rate", label: "Booking rate %", suffix: "%" },
  { key: "after_hours", label: "After-hours capture %", suffix: "%" },
  { key: "recovery", label: "Missed-call recovery %", suffix: "%" },
  { key: "aht", label: "Avg handle time (s)", suffix: "s" },
  { key: "csat", label: "CSAT proxy (/5)", suffix: "/5" },
  { key: "emergency_fp", label: "False-positive emergency %", suffix: "%" },
] as const;

export default function KPITargets({ deployment, onUpdate }: { deployment: any; onUpdate: (p: any) => Promise<void> | void }) {
  const initial = { ...ROOFERS_DEFAULT_KPI_TARGETS, ...(deployment.config?.kpi_targets ?? {}) };
  const [vals, setVals] = useState<Record<string, number>>(initial);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({ config: { ...(deployment.config ?? {}), kpi_targets: vals } });
      toast.success("Targets saved");
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Target className="h-4 w-4" /> KPI targets</CardTitle>
        <CardDescription>Calibrate to your real baseline — defaults reflect top-quartile residential roofing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                type="number"
                value={vals[f.key] ?? ""}
                onChange={e => setVals(v => ({ ...v, [f.key]: Number(e.target.value) }))}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save targets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
