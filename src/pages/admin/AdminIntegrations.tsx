import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import {
  Plug, CheckCircle2, XCircle, AlertTriangle, Activity, Key, Settings2,
  Shield, ChevronRight, Server, Route, BarChart3, Clock, Zap,
  Power, PauseCircle, PlayCircle, DollarSign, Globe, Lock,
  TrendingUp, AlertCircle, Gauge, Layers
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useVideoProviders, useProviderModels, useRoutingRules
} from "@/hooks/useVideoProviders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tab = "first-party" | "byo" | "models" | "routing" | "business" | "health";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "first-party", label: "First-Party", icon: Server },
  { id: "byo", label: "BYO Providers", icon: Key },
  { id: "models", label: "Model Registry", icon: Layers },
  { id: "routing", label: "Routing Rules", icon: Route },
  { id: "business", label: "Business Controls", icon: DollarSign },
  { id: "health", label: "Health & Monitoring", icon: Activity },
];

const SLA_TIERS = ["standard", "premium", "enterprise"];
const PLANS = ["free", "basic", "agency", "agency_plus"];

export default function AdminIntegrations() {
  const [tab, setTab] = useState<Tab>("first-party");
  const { data: providers, isLoading, refetch } = useVideoProviders();
  const { data: models } = useProviderModels();
  const { data: rules } = useRoutingRules();

  const firstParty = providers?.filter((p: any) => p.provider_type === "first_party") || [];
  const byoProviders = providers?.filter((p: any) => p.provider_type === "byo_api") || [];

  const toggleGlobalStatus = async (providerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
    const { error } = await supabase
      .from("video_providers" as any)
      .update({ global_status: newStatus } as any)
      .eq("id", providerId);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success(`Provider ${newStatus}`);
    refetch();
  };

  const setMaintenance = async (providerId: string) => {
    const { error } = await supabase
      .from("video_providers" as any)
      .update({ global_status: "maintenance", business_status_reason: "Scheduled maintenance" } as any)
      .eq("id", providerId);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Provider set to maintenance mode");
    refetch();
  };

  const statusIcon = (status: string) => {
    if (status === "enabled" || status === "active") return <CheckCircle2 className="h-4 w-4 text-primary" />;
    if (status === "maintenance") return <PauseCircle className="h-4 w-4 text-accent" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const statusBadge = (status: string) => {
    const cls = status === "enabled" || status === "active"
      ? "bg-primary/10 text-primary border-primary/20"
      : status === "maintenance"
      ? "bg-accent/10 text-accent-foreground border-accent/20"
      : "bg-destructive/10 text-destructive border-destructive/20";
    return (
      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>
        {status}
      </span>
    );
  };

  // ── Provider Card (shared between First-Party and BYO) ──
  const ProviderCard = ({ provider, showByo = false }: { provider: any; showByo?: boolean }) => (
    <div className="glass-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Plug className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{provider.name}</span>
              {statusBadge(provider.global_status || provider.status)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {provider.supports_t2v && <Badge variant="outline" className="text-[9px] h-4 px-1.5">T2V</Badge>}
              {provider.supports_i2v && <Badge variant="outline" className="text-[9px] h-4 px-1.5">I2V</Badge>}
              {provider.supports_a2v && <Badge variant="outline" className="text-[9px] h-4 px-1.5">A2V</Badge>}
              {provider.supports_retake && <Badge variant="outline" className="text-[9px] h-4 px-1.5">Retake</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={provider.global_status === "enabled" || provider.status === "active"}
            onCheckedChange={() => toggleGlobalStatus(provider.id, provider.global_status || provider.status)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-secondary/40">
          <span className="text-muted-foreground">SLA Tier</span>
          <p className="font-medium capitalize mt-0.5">{provider.sla_tier || "standard"}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/40">
          <span className="text-muted-foreground">Cost Multiplier</span>
          <p className="font-medium mt-0.5">{provider.cost_multiplier || 1.0}×</p>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/40 col-span-2">
          <span className="text-muted-foreground">Allowed Plans</span>
          <div className="flex gap-1 mt-1 flex-wrap">
            {(provider.allowed_plans || PLANS).map((p: string) => (
              <Badge key={p} variant="secondary" className="text-[9px] h-4 px-1.5 capitalize">{p.replace("_", " ")}</Badge>
            ))}
          </div>
        </div>
      </div>

      {provider.business_status_reason && (
        <div className="mt-3 p-2.5 rounded-lg bg-accent/5 border border-accent/10 text-xs">
          <span className="text-muted-foreground">Status Reason:</span>{" "}
          <span className="font-medium">{provider.business_status_reason}</span>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8"
          onClick={() => setMaintenance(provider.id)}
        >
          <PauseCircle className="h-3.5 w-3.5 mr-1" /> Maintenance
        </Button>
        {showByo && (
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Shield className="h-3.5 w-3.5 mr-1" /> Compliance
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout title="Integration Governance" description="Manage providers, routing, business controls, and platform health.">
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── First-Party Providers ─── */}
      {tab === "first-party" && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">Platform-managed AI providers with centralized key management.</p>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading providers…</div>
          ) : firstParty.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Server className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No first-party providers configured.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {firstParty.map((p: any) => <ProviderCard key={p.id} provider={p} />)}
            </div>
          )}
        </div>
      )}

      {/* ─── BYO Providers ─── */}
      {tab === "byo" && (
        <div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10 mb-4">
            <Shield className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-sm font-medium">BYO API Key Security</p>
              <p className="text-xs text-muted-foreground">Org-managed keys are AES-256 encrypted. Disabled providers prevent new key additions.</p>
            </div>
          </div>
          {byoProviders.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Key className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No BYO providers configured.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {byoProviders.map((p: any) => <ProviderCard key={p.id} provider={p} showByo />)}
            </div>
          )}
        </div>
      )}

      {/* ─── Model Registry ─── */}
      {tab === "models" && (
        <div className="glass-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold">Model Registry</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Enable/disable models, set quality tiers and cost multipliers.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Model</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Provider</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Tier</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Modalities</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Max</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Cost</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Fallback</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {models?.map((m: any) => (
                  <tr key={m.id} className="hover:bg-secondary/20">
                    <td className="px-6 py-3 font-medium">{m.display_name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{m.video_providers?.name || "—"}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        m.quality_tier === "cinematic"
                          ? "bg-accent/10 text-accent-foreground border border-accent/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}>{m.quality_tier}</span>
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">{m.modalities?.join(", ")}</td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">{m.max_seconds}s · {m.max_resolution}</td>
                    <td className="px-6 py-3 text-xs font-medium">{m.cost_multiplier || 1.0}×</td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">#{m.fallback_priority || 0}</td>
                    <td className="px-6 py-3">
                      {m.is_enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Routing Rules ─── */}
      {tab === "routing" && (
        <div className="glass-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold">Routing Rules</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Map modality + quality tier → primary provider with ordered fallbacks.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Modality</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Quality Tier</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Primary Provider</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Fallbacks</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules?.map((r: any) => (
                  <tr key={r.id} className="hover:bg-secondary/20">
                    <td className="px-6 py-3 font-medium uppercase text-xs">{r.modality}</td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {r.quality_tier}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{r.video_providers?.name || "—"}</td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">
                      {r.fallback_provider_ids?.length > 0
                        ? `${r.fallback_provider_ids.length} configured`
                        : "None"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{r.priority}</td>
                    <td className="px-6 py-3">
                      {r.is_active ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Business Controls ─── */}
      {tab === "business" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
            <AlertCircle className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-sm font-medium">Business Override Controls</p>
              <p className="text-xs text-muted-foreground">
                Temporarily deactivate providers for cost spikes, SLA breaches, legal review, or performance issues. All changes are audit-logged.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {providers?.map((p: any) => (
              <div key={p.id} className="glass-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {statusIcon(p.global_status || p.status)}
                    <span className="font-semibold text-sm">{p.name}</span>
                  </div>
                  {statusBadge(p.global_status || p.status)}
                </div>

                <div className="space-y-3">
                  {/* Quick actions */}
                  <div className="flex gap-2 flex-wrap">
                    {["Cost Optimization", "SLA Breach", "Legal Hold", "Performance Review"].map((reason) => (
                      <Button
                        key={reason}
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-7 px-2"
                        onClick={async () => {
                          const { error } = await supabase
                            .from("video_providers" as any)
                            .update({ global_status: "disabled", business_status_reason: reason } as any)
                            .eq("id", p.id);
                          if (error) { toast.error("Failed"); return; }
                          toast.success(`${p.name} disabled: ${reason}`);
                          refetch();
                        }}
                      >
                        {reason}
                      </Button>
                    ))}
                  </div>

                  {/* Re-enable */}
                  {(p.global_status === "disabled" || p.global_status === "maintenance") && (
                    <Button
                      size="sm"
                      className="text-xs h-8 w-full"
                      onClick={async () => {
                        const { error } = await supabase
                          .from("video_providers" as any)
                          .update({ global_status: "enabled", business_status_reason: null } as any)
                          .eq("id", p.id);
                        if (error) { toast.error("Failed"); return; }
                        toast.success(`${p.name} re-enabled`);
                        refetch();
                      }}
                    >
                      <PlayCircle className="h-3.5 w-3.5 mr-1" /> Re-enable Provider
                    </Button>
                  )}

                  {/* Cost guardrails */}
                  <div className="p-3 rounded-lg bg-secondary/40 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cost Multiplier</span>
                      <span className="font-medium">{p.cost_multiplier || 1.0}×</span>
                    </div>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-muted-foreground">SLA Tier</span>
                      <span className="font-medium capitalize">{p.sla_tier || "standard"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Health & Monitoring ─── */}
      {tab === "health" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Providers", value: providers?.length || 0, icon: Server, color: "text-primary" },
              { label: "Active Providers", value: providers?.filter((p: any) => (p.global_status || p.status) === "enabled" || (p.global_status || p.status) === "active").length || 0, icon: CheckCircle2, color: "text-primary" },
              { label: "In Maintenance", value: providers?.filter((p: any) => p.global_status === "maintenance").length || 0, icon: PauseCircle, color: "text-accent" },
              { label: "Disabled", value: providers?.filter((p: any) => p.global_status === "disabled").length || 0, icon: XCircle, color: "text-destructive" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-5">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Provider Health Status</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time provider health indicators.</p>
            </div>
            <div className="divide-y divide-border">
              {providers?.map((p: any) => {
                const isUp = (p.global_status || p.status) === "enabled" || (p.global_status || p.status) === "active";
                return (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        isUp ? "bg-primary" : p.global_status === "maintenance" ? "bg-accent" : "bg-destructive"
                      }`} />
                      <div>
                        <span className="text-sm font-medium">{p.name}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {p.provider_type === "first_party" ? "Platform Managed" : "BYO API"}
                          {p.business_status_reason && ` · ${p.business_status_reason}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <div className="text-right">
                        <p className="text-[10px]">Latency</p>
                        <p className="font-medium text-foreground">—</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px]">Failure Rate</p>
                        <p className="font-medium text-foreground">—</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px]">Active Jobs</p>
                        <p className="font-medium text-foreground">0</p>
                      </div>
                      {statusBadge(p.global_status || p.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
