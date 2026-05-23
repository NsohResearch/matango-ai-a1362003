import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { KAH_GUARDRAILS } from "@/lib/operatorToolRegistry";
import { toast } from "sonner";
import { ShieldCheck, Mic, RefreshCw, PhoneCall, PhoneOff, Loader2 } from "lucide-react";
import { RetellWebClient } from "retell-client-js-sdk";

export default function VoiceConfig({ deployment, onUpdate }: { deployment: any; onUpdate: (p: any) => void }) {
  const [voiceId, setVoiceId] = useState(deployment.voice_id ?? "11labs-Adrian");
  const [phone, setPhone] = useState(deployment.phone_number ?? "");
  const [bilingual, setBilingual] = useState(deployment.config?.bilingual ?? true);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const clientRef = useRef<RetellWebClient | null>(null);

  const saveLocal = async () => {
    await onUpdate({
      voice_id: voiceId || null,
      phone_number: phone || null,
      config: { ...(deployment.config ?? {}), bilingual },
    });
    toast.success("Saved");
  };

  const syncToRetell = async () => {
    setSyncing(true);
    try {
      await saveLocal();
      const { data, error } = await supabase.functions.invoke("operator-retell-session", {
        body: { deployment_id: deployment.id, action: "sync_agent" },
      });
      if (error) throw error;
      if ((data as any)?.stub) toast.message("Stub mode — add RETELL_API_KEY to provision the live agent.");
      else toast.success(`Synced ${(data as any).tools_synced} tools to Retell`);
      setSystemPrompt((data as any)?.system_prompt ?? "");
    } catch (e: any) { toast.error(e.message); }
    setSyncing(false);
  };

  const startWebCall = async () => {
    setCalling(true);
    try {
      const { data, error } = await supabase.functions.invoke("operator-retell-session", {
        body: { deployment_id: deployment.id, action: "web_call" },
      });
      if (error) throw error;
      if (!(data as any)?.access_token) { toast.error("Add RETELL_API_KEY first"); setCalling(false); return; }
      const client = new RetellWebClient();
      clientRef.current = client;
      client.on("call_started", () => setCallActive(true));
      client.on("call_ended", () => { setCallActive(false); setCalling(false); });
      client.on("error", (e: any) => { toast.error(e?.message ?? "Call error"); setCallActive(false); setCalling(false); });
      await client.startCall({ accessToken: (data as any).access_token });
    } catch (e: any) { toast.error(e.message); setCalling(false); }
  };

  const stopCall = async () => {
    try { clientRef.current?.stopCall(); } catch { /* noop */ }
    setCallActive(false); setCalling(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PhoneCall className="h-4 w-4" /> Retell voice</CardTitle>
          <CardDescription>Bilingual, low-latency voice agent with full Ka'h tool-calling.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label>Forwarding phone (E.164)</Label><Input placeholder="+15551234567" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div><Label>Voice ID</Label><Input placeholder="11labs-Adrian or eleven_..." value={voiceId} onChange={e => setVoiceId(e.target.value)} /></div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label>Bilingual (EN + ES)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch checked={bilingual} onCheckedChange={setBilingual} />
                  <span className="text-sm text-muted-foreground">{bilingual ? "Auto-detect Spanish" : "English only"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={syncToRetell} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync Ka'h to Retell
            </Button>
            {!callActive ? (
              <Button variant="outline" onClick={startWebCall} disabled={calling}>
                {calling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mic className="h-4 w-4 mr-2" />}
                Start web test call
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopCall}><PhoneOff className="h-4 w-4 mr-2" /> End call</Button>
            )}
          </div>
          {deployment.config?.retell_agent_id && (
            <p className="text-xs text-muted-foreground">Agent ID: <span className="font-mono">{deployment.config.retell_agent_id}</span></p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Guardrails (always enforced)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {KAH_GUARDRAILS.map(g => (
            <div key={g.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-2"><span className="font-medium text-sm">{g.title}</span><Badge variant="outline">non-negotiable</Badge></div>
              <p className="text-xs text-muted-foreground mt-1">{g.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {systemPrompt && (
        <Card>
          <CardHeader><CardTitle>Assembled system prompt</CardTitle><CardDescription>What Ka'h reads on every call.</CardDescription></CardHeader>
          <CardContent><Textarea rows={16} readOnly value={systemPrompt} className="font-mono text-xs" /></CardContent>
        </Card>
      )}
    </div>
  );
}
