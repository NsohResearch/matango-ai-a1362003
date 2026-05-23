import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ROOFERS_DEFAULT_HANDOFF, ROOFERS_DEFAULT_HOURS } from "@/lib/knowledgePacks/roofers";
import { Loader2, PhoneForwarded, Clock, ShieldCheck, MessageSquare, Building2 } from "lucide-react";
import { toast } from "sonner";

const CRM_OPTIONS = [
  { id: "jobnimbus", label: "JobNimbus (recommended)" },
  { id: "acculynx", label: "AccuLynx" },
  { id: "roofr", label: "Roofr" },
  { id: "hubspot", label: "HubSpot" },
  { id: "none", label: "Email / SMS only (no CRM yet)" },
];

const TZ = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Phoenix", "America/Anchorage", "Pacific/Honolulu",
];

export default function HandoffCompliance({ deployment, onUpdate }: { deployment: any; onUpdate: (p: any) => Promise<void> | void }) {
  const cfg = { ...ROOFERS_DEFAULT_HANDOFF, ...(deployment.config?.handoff ?? {}) };
  const hours = { ...ROOFERS_DEFAULT_HOURS, ...(deployment.business_hours ?? {}) };

  const [crm, setCrm] = useState(cfg.crm_provider);
  const [leadEmail, setLeadEmail] = useState(cfg.lead_email ?? "");
  const [leadSms, setLeadSms] = useState(cfg.lead_sms ?? "");
  const [emergencyNum, setEmergencyNum] = useState(cfg.emergency_transfer_number ?? "");
  const [hotNum, setHotNum] = useState(cfg.hot_lead_transfer_number ?? "");
  const [afterHoursNum, setAfterHoursNum] = useState(cfg.after_hours_voicemail_number ?? "");
  const [afterMsg, setAfterMsg] = useState(cfg.after_hours_message ?? "");
  const [textBack, setTextBack] = useState(cfg.missed_call_text_back ?? "");

  const [tz, setTz] = useState(hours.timezone);
  const [wdStart, setWdStart] = useState(hours.weekdays?.start ?? "07:00");
  const [wdEnd, setWdEnd] = useState(hours.weekdays?.end ?? "19:00");
  const [satOn, setSatOn] = useState(!!hours.saturday);
  const [satStart, setSatStart] = useState(hours.saturday?.start ?? "08:00");
  const [satEnd, setSatEnd] = useState(hours.saturday?.end ?? "16:00");
  const [sunOn, setSunOn] = useState(!!hours.sunday);
  const [sunStart, setSunStart] = useState(hours.sunday?.start ?? "09:00");
  const [sunEnd, setSunEnd] = useState(hours.sunday?.end ?? "14:00");

  const compliance = deployment.config?.compliance ?? {};
  const [recordingEn, setRecordingEn] = useState(compliance.recording_en ?? "This call is recorded for quality and training. By staying on the line you consent to recording.");
  const [recordingEs, setRecordingEs] = useState(compliance.recording_es ?? "Esta llamada se graba para calidad y capacitación. Al permanecer en la línea, usted acepta la grabación.");
  const [tcpaAck, setTcpaAck] = useState(!!compliance.tcpa_acknowledged);
  const [dncScrub, setDncScrub] = useState(compliance.dnc_scrub ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({
        business_hours: {
          timezone: tz,
          weekdays: { start: wdStart, end: wdEnd },
          saturday: satOn ? { start: satStart, end: satEnd } : null,
          sunday: sunOn ? { start: sunStart, end: sunEnd } : null,
        },
        config: {
          ...(deployment.config ?? {}),
          handoff: {
            crm_provider: crm,
            lead_email: leadEmail.trim(),
            lead_sms: leadSms.trim(),
            emergency_transfer_number: emergencyNum.trim(),
            hot_lead_transfer_number: hotNum.trim(),
            after_hours_voicemail_number: afterHoursNum.trim(),
            after_hours_message: afterMsg.trim(),
            missed_call_text_back: textBack.trim(),
          },
          compliance: {
            recording_en: recordingEn.trim(),
            recording_es: recordingEs.trim(),
            tcpa_acknowledged: tcpaAck,
            dnc_scrub: dncScrub,
            tcpa_acknowledged_at: tcpaAck && !compliance.tcpa_acknowledged_at ? new Date().toISOString() : compliance.tcpa_acknowledged_at,
          },
        },
      });
      toast.success("Handoff & compliance saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" /> CRM &amp; lead handoff</CardTitle>
          <CardDescription>Where qualified leads land the moment Ka'h marks them hot or warm.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>CRM</Label>
              <Select value={crm} onValueChange={setCrm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CRM_OPTIONS.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fallback lead email</Label>
              <Input placeholder="sales@yourcompany.com" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} />
            </div>
            <div>
              <Label>Fallback lead SMS</Label>
              <Input placeholder="+15551234567" value={leadSms} onChange={e => setLeadSms(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">If the CRM call fails, Ka'h still delivers the lead by email + SMS so nothing is lost.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PhoneForwarded className="h-4 w-4" /> Live-transfer targets</CardTitle>
          <CardDescription>Phone numbers Ka'h warm-transfers to in real time.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Emergency / active leak</Label>
            <Input placeholder="+1 555 010 0001" value={emergencyNum} onChange={e => setEmergencyNum(e.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-1">On-call number, 24/7.</p>
          </div>
          <div>
            <Label>Hot insurance lead</Label>
            <Input placeholder="+1 555 010 0002" value={hotNum} onChange={e => setHotNum(e.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-1">Score ≥ 75 — straight to closer.</p>
          </div>
          <div>
            <Label>After-hours voicemail</Label>
            <Input placeholder="+1 555 010 0003" value={afterHoursNum} onChange={e => setAfterHoursNum(e.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-1">Optional — overflow box.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Business hours</CardTitle>
          <CardDescription>Ka'h answers 24/7; these hours decide when human transfers are attempted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Timezone</Label>
              <Select value={tz} onValueChange={setTz}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TZ.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Weekday open</Label><Input type="time" value={wdStart} onChange={e => setWdStart(e.target.value)} /></div>
            <div><Label>Weekday close</Label><Input type="time" value={wdEnd} onChange={e => setWdEnd(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="flex items-center gap-3"><Switch checked={satOn} onCheckedChange={setSatOn} /><Label>Saturday open</Label></div>
            <div><Input type="time" value={satStart} onChange={e => setSatStart(e.target.value)} disabled={!satOn} /></div>
            <div><Input type="time" value={satEnd} onChange={e => setSatEnd(e.target.value)} disabled={!satOn} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="flex items-center gap-3"><Switch checked={sunOn} onCheckedChange={setSunOn} /><Label>Sunday open</Label></div>
            <div><Input type="time" value={sunStart} onChange={e => setSunStart(e.target.value)} disabled={!sunOn} /></div>
            <div><Input type="time" value={sunEnd} onChange={e => setSunEnd(e.target.value)} disabled={!sunOn} /></div>
          </div>
          <div>
            <Label>After-hours greeting</Label>
            <Textarea rows={2} value={afterMsg} onChange={e => setAfterMsg(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Missed-call text-back</CardTitle>
          <CardDescription>Auto-SMS sent within 60s if a call drops before Ka'h answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea rows={3} value={textBack} onChange={e => setTextBack(e.target.value)} />
          <p className="text-[11px] text-muted-foreground mt-1">Must include "Reply STOP to opt out" for TCPA / 10DLC compliance.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Compliance</CardTitle>
          <CardDescription>Recording disclosures + TCPA acknowledgement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Recording disclosure (English)</Label>
            <Textarea rows={2} value={recordingEn} onChange={e => setRecordingEn(e.target.value)} />
          </div>
          <div>
            <Label>Recording disclosure (Spanish)</Label>
            <Textarea rows={2} value={recordingEs} onChange={e => setRecordingEs(e.target.value)} />
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">DNC list scrub for outbound SMS</p>
              <p className="text-xs text-muted-foreground">Block known-litigator and federal DNC numbers before sending.</p>
            </div>
            <Switch checked={dncScrub} onCheckedChange={setDncScrub} />
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">TCPA / 10DLC acknowledgement</p>
              <p className="text-xs text-muted-foreground">I have written consent for every number Ka'h will text and I'll honor STOP / UNSUBSCRIBE instantly.</p>
            </div>
            <div className="flex items-center gap-2">
              {compliance.tcpa_acknowledged_at && <Badge variant="outline" className="text-[10px]">Signed {new Date(compliance.tcpa_acknowledged_at).toLocaleDateString()}</Badge>}
              <Switch checked={tcpaAck} onCheckedChange={setTcpaAck} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save handoff &amp; compliance
        </Button>
      </div>
    </div>
  );
}
