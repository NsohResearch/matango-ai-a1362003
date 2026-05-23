import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PhoneIncoming, PhoneMissed, AlertTriangle, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CallLog {
  id: string;
  caller_name: string | null;
  caller_number: string | null;
  started_at: string;
  duration_seconds: number | null;
  disposition: string | null;
  lead_type: string | null;
  qualification_score: number | null;
  is_emergency: boolean | null;
  in_service_area: boolean | null;
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
}

export default function CallsInbox({ deploymentId }: { deploymentId: string }) {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<CallLog | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("operator_call_logs")
        .select("*")
        .eq("deployment_id", deploymentId)
        .order("started_at", { ascending: false })
        .limit(200);
      setCalls((data as CallLog[]) ?? []);
      setLoading(false);
    })();
  }, [deploymentId]);

  const filtered = calls.filter(c => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      c.caller_name?.toLowerCase().includes(q) ||
      c.caller_number?.includes(q) ||
      c.summary?.toLowerCase().includes(q) ||
      c.lead_type?.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Call inbox</CardTitle>
          <CardDescription>{calls.length} calls · last 200 shown</CardDescription>
          <Input placeholder="Search caller, number, summary…" value={filter} onChange={e => setFilter(e.target.value)} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No calls yet. Ka'h will populate this once your number is live.</p>
          ) : filtered.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left p-2 rounded border text-sm hover:bg-accent ${selected?.id === c.id ? "bg-accent" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{c.caller_name ?? c.caller_number ?? "Unknown"}</span>
                <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(c.started_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {c.is_emergency && <Badge variant="destructive" className="text-[10px] h-4"><Flame className="h-2.5 w-2.5 mr-1" />Emergency</Badge>}
                {c.disposition === "missed" && <Badge variant="outline" className="text-[10px] h-4"><PhoneMissed className="h-2.5 w-2.5 mr-1" />Missed</Badge>}
                {c.disposition && c.disposition !== "missed" && <Badge variant="secondary" className="text-[10px] h-4">{c.disposition}</Badge>}
                {c.lead_type && <Badge className="text-[10px] h-4">{c.lead_type}</Badge>}
                {c.qualification_score != null && <span className="text-[10px] text-muted-foreground">Score {c.qualification_score}</span>}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        {selected ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PhoneIncoming className="h-4 w-4" />{selected.caller_name ?? selected.caller_number ?? "Unknown caller"}</CardTitle>
              <CardDescription>
                {new Date(selected.started_at).toLocaleString()} · {selected.duration_seconds ?? 0}s · {selected.in_service_area === false && <span className="text-amber-600"><AlertTriangle className="inline h-3 w-3 mr-0.5" />Out of service area</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected.recording_url && (
                <audio controls src={selected.recording_url} className="w-full" />
              )}
              {selected.summary && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{selected.summary}</p>
                </div>
              )}
              {selected.transcript && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Transcript</h4>
                  <pre className="text-xs bg-muted p-3 rounded whitespace-pre-wrap font-sans max-h-80 overflow-y-auto">{selected.transcript}</pre>
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Push to CRM</Button>
                <Button size="sm" variant="outline">Mark for review</Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-16 text-center text-sm text-muted-foreground">Select a call to view transcript and recording.</CardContent>
        )}
      </Card>
    </div>
  );
}
