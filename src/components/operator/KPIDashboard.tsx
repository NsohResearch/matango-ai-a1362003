import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface KPI { id: string; date: string; calls_total: number; calls_answered: number; calls_qualified: number; calls_booked: number; calls_transferred: number; calls_emergency: number; after_hours_captured: number; missed_call_recovered: number; avg_handle_seconds: number; csat_avg: number | null }

const TARGETS = [
  { key: "answer_rate", label: "Answer rate", target: 98, unit: "%" },
  { key: "qual_rate", label: "Qualification rate", target: 70, unit: "%" },
  { key: "book_rate", label: "Booking rate", target: 55, unit: "%" },
  { key: "after_hours", label: "After-hours capture", target: 80, unit: "%" },
  { key: "recovery", label: "Missed-call recovery", target: 35, unit: "%" },
  { key: "aht", label: "Avg handle time", target: 300, unit: "s", lower: true },
  { key: "csat", label: "CSAT proxy", target: 4.2, unit: "/5" },
  { key: "emergency_fp", label: "False-positive emergency", target: 10, unit: "%", lower: true },
];

export default function KPIDashboard({ deploymentId }: { deploymentId: string }) {
  const [rows, setRows] = useState<KPI[]>([]);

  useEffect(() => {
    if (!deploymentId) return;
    (supabase as any).from("operator_kpi_daily").select("*").eq("deployment_id", deploymentId).order("date", { ascending: false }).limit(30).then(({ data }: any) => setRows(data ?? []));
  }, [deploymentId]);

  const sum = (k: keyof KPI) => rows.reduce((n, r) => n + (Number(r[k]) || 0), 0);
  const total = sum("calls_total"); const answered = sum("calls_answered");
  const qual = sum("calls_qualified"); const booked = sum("calls_booked");
  const afterHours = sum("after_hours_captured");
  const recovered = sum("missed_call_recovered");
  const aht = rows.length ? Math.round(sum("avg_handle_seconds") / rows.length) : 0;
  const csat = rows.length && rows.some(r => r.csat_avg != null)
    ? (rows.filter(r => r.csat_avg != null).reduce((n, r) => n + (r.csat_avg ?? 0), 0) / rows.filter(r => r.csat_avg != null).length).toFixed(2)
    : "—";

  const pct = (n: number, d: number) => d ? Math.round((n / d) * 100) : 0;
  const values: Record<string, number | string> = {
    answer_rate: pct(answered, total),
    qual_rate: pct(qual, answered),
    book_rate: pct(booked, qual),
    after_hours: pct(afterHours, total),
    recovery: pct(recovered, Math.max(total - answered, 1)),
    aht,
    csat,
    emergency_fp: pct(sum("calls_emergency"), Math.max(answered, 1)),
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Last 30 days</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Calls" value={total} />
            <Stat label="Answered" value={answered} />
            <Stat label="Qualified" value={qual} />
            <Stat label="Booked" value={booked} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>KPI targets</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TARGETS.map(t => {
              const v = values[t.key];
              const num = Number(v);
              const ok = t.lower ? num <= t.target : num >= t.target;
              return (
                <div key={t.key} className="rounded-lg border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">Target {t.lower ? "≤" : "≥"} {t.target}{t.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{v}{typeof v === "number" ? t.unit : ""}</p>
                    <Badge variant={ok ? "default" : "outline"}>{ok ? "On target" : rows.length ? "Below" : "No data"}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
