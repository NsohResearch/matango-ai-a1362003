import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Globe, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  organizationId?: string;
  plan?: string;
  initialDomain?: string;
  initialVerified?: boolean;
  initialToken?: string;
}

function generateToken() {
  const arr = new Uint8Array(18);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function DomainVerificationPanel({
  organizationId,
  plan = "free",
  initialDomain = "",
  initialVerified = false,
  initialToken = "",
}: Props) {
  const [domain, setDomain] = useState(initialDomain);
  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState<"idle" | "pending" | "verified">(
    initialVerified ? "verified" : initialToken ? "pending" : "idle"
  );
  const [saving, setSaving] = useState(false);

  const isAgency = plan.toLowerCase().includes("agency");
  const recordName = domain ? `_matango.${domain}`.replace(/\.+/g, ".") : "";
  const recordValue = token ? `matango-verification=${token}` : "";

  async function onStart() {
    if (!domain || domain.length < 3) {
      toast.error("Enter a valid domain (e.g., app.yourbrand.com)");
      return;
    }
    if (!organizationId) {
      toast.error("Organization context required");
      return;
    }
    setSaving(true);
    try {
      const newToken = generateToken();
      const { error } = await supabase
        .from("white_label_settings")
        .update({
          custom_domain: domain,
          domain_verification_token: newToken,
          domain_verified: false,
        })
        .eq("org_id", organizationId);
      if (error) throw error;

      setToken(newToken);
      setStatus("pending");
      toast.success("DNS record generated. Add the TXT record below to your DNS.");
    } catch (err: any) {
      toast.error(err.message || "Failed to start verification");
    } finally {
      setSaving(false);
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="space-y-4">
      {!isAgency && (
        <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          Custom domains are available on the <strong className="text-foreground">Agency</strong> plan.
        </div>
      )}

      <div>
        <Label>Custom Domain</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value.trim())}
            placeholder="app.yourbrand.com"
            disabled={!isAgency}
            className="flex-1"
          />
          <Button
            onClick={onStart}
            disabled={!isAgency || saving || status === "verified"}
            size="sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4 mr-1" />}
            {status === "idle" ? "Generate DNS" : "Regenerate"}
          </Button>
        </div>
      </div>

      {status !== "idle" && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
          <div className="text-sm font-semibold text-foreground">Add this TXT record to your DNS</div>
          <div className="space-y-2">
            <KVRow label="Type" value="TXT" />
            <KVRow label="Name" value={recordName} onCopy={() => copyToClipboard(recordName, "Name")} />
            <KVRow label="Value" value={recordValue} onCopy={() => copyToClipboard(recordValue, "Value")} />
          </div>
          <p className="text-xs text-muted-foreground">
            DNS propagation can take a few minutes to a few hours. Once added, click "Verify Now" or wait for auto-check.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        {status === "pending" && (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400">
            <AlertTriangle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )}
        {status === "verified" && (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
          </Badge>
        )}
      </div>

      {status === "verified" && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-300">
          Domain verified. SSL provisioning will begin automatically.
        </div>
      )}
    </div>
  );
}

function KVRow({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="grid grid-cols-[70px_1fr_auto] items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <code className="text-xs font-mono text-foreground break-all bg-muted/20 rounded px-2 py-1">{value}</code>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:border-gold-400/40 transition-colors"
        >
          <Copy className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
