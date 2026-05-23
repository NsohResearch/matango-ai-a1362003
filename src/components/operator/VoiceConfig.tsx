import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { KAH_GUARDRAILS } from "@/lib/operatorToolRegistry";
import { toast } from "sonner";
import { ShieldCheck, Mic } from "lucide-react";

export default function VoiceConfig({ deployment, onUpdate }: { deployment: any; onUpdate: (p: any) => void }) {
  const [voiceId, setVoiceId] = useState(deployment.voice_id ?? "");
  const [agentId, setAgentId] = useState(deployment.config?.elevenlabs_agent_id ?? "");
  const [phone, setPhone] = useState(deployment.phone_number ?? "");
  const [previewing, setPreviewing] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  const save = async () => {
    await onUpdate({
      voice_id: voiceId || null,
      phone_number: phone || null,
      config: { ...(deployment.config ?? {}), elevenlabs_agent_id: agentId || null },
    });
    toast.success("Voice settings saved");
  };

  const preview = async () => {
    setPreviewing(true);
    try {
      const { data, error } = await supabase.functions.invoke("operator-voice-session", {
        body: { deployment_id: deployment.id },
      });
      if (error) throw error;
      setSystemPrompt((data as any)?.system_prompt ?? "");
      if ((data as any)?.stub) toast.message("Stub mode — add ELEVENLABS_API_KEY + agent ID to start live sessions.");
      else toast.success("Live token issued");
    } catch (e: any) { toast.error(e.message); }
    setPreviewing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Channel & voice</CardTitle><CardDescription>Phone number, ElevenLabs voice, and agent ID.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label>Forwarding phone (E.164)</Label><Input placeholder="+15551234567" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div><Label>ElevenLabs voice ID</Label><Input placeholder="EXAVITQu4vr4xnSDxMaL" value={voiceId} onChange={e => setVoiceId(e.target.value)} /></div>
            <div><Label>ElevenLabs agent ID</Label><Input placeholder="agent_..." value={agentId} onChange={e => setAgentId(e.target.value)} /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" disabled={previewing} onClick={preview}><Mic className="h-4 w-4 mr-2" />Preview system prompt</Button>
          </div>
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
          <CardHeader><CardTitle>Assembled system prompt</CardTitle><CardDescription>What Ka'h will read on every call.</CardDescription></CardHeader>
          <CardContent><Textarea rows={16} readOnly value={systemPrompt} className="font-mono text-xs" /></CardContent>
        </Card>
      )}
    </div>
  );
}
