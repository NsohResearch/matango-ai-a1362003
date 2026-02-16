import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import {
  Plug, Server, Key, Route, BarChart3, Settings2,
  Shield, ChevronRight, CheckCircle2, XCircle, Clock
} from "lucide-react";
import {
  useVideoProviders, useProviderModels, useRoutingRules
} from "@/hooks/useVideoProviders";

type Tab = "providers" | "models" | "routing" | "quotas" | "keys";

const AdminVideoProviders = () => {
  const [tab, setTab] = useState<Tab>("providers");
  const { data: providers, isLoading: loadingProviders } = useVideoProviders();
  const { data: models } = useProviderModels();
  const { data: rules } = useRoutingRules();

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "providers", label: "Video Providers", icon: Plug },
    { id: "models", label: "Models", icon: Server },
    { id: "routing", label: "Routing Rules", icon: Route },
    { id: "quotas", label: "Org Quotas", icon: BarChart3 },
    { id: "keys", label: "BYO Keys", icon: Key },
  ];

  const statusBadge = (status: string) => {
    const cls = status === "active"
      ? "bg-primary/10 text-primary"
      : status === "coming_soon"
      ? "bg-accent/10 text-accent-foreground"
      : "bg-muted text-muted-foreground";
    return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}>{status.replace("_", " ")}</span>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings2 className="h-7 w-7 text-primary" />
          <h1 className="font-display text-2xl font-bold">Video Provider Management</h1>
        </div>

        {/* Tabs */}
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

        {/* Providers Tab */}
        {tab === "providers" && (
          <div className="glass-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Registered Providers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">First-party and BYO API providers available for video generation.</p>
            </div>
            <div className="divide-y divide-border">
              {loadingProviders ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
              ) : (
                providers?.map((p: any) => (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Plug className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{p.name}</span>
                          {statusBadge(p.status)}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            p.provider_type === "first_party" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"
                          }`}>
                            {p.provider_type === "first_party" ? "Managed" : "BYO API"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {p.supports_t2v && <span className="text-[10px] text-muted-foreground">T2V</span>}
                          {p.supports_i2v && <span className="text-[10px] text-muted-foreground">I2V</span>}
                          {p.supports_a2v && <span className="text-[10px] text-muted-foreground">A2V</span>}
                          {p.supports_retake && <span className="text-[10px] text-muted-foreground">Retake</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Models Tab */}
        {tab === "models" && (
          <div className="glass-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Provider Models</h3>
              <p className="text-xs text-muted-foreground mt-0.5">AI models available for video generation across all providers.</p>
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
                          m.quality_tier === "cinematic" ? "bg-accent/10 text-accent-foreground" : "bg-primary/10 text-primary"
                        }`}>{m.quality_tier}</span>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{m.modalities?.join(", ")}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{m.max_seconds}s · {m.max_resolution}</td>
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

        {/* Routing Rules Tab */}
        {tab === "routing" && (
          <div className="glass-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Routing Rules</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Configure which provider handles each modality + quality tier combination.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Modality</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Quality Tier</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Primary Provider</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Priority</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rules?.map((r: any) => (
                    <tr key={r.id} className="hover:bg-secondary/20">
                      <td className="px-6 py-3 font-medium uppercase text-xs">{r.modality}</td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">{r.quality_tier}</span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{r.video_providers?.name || "—"}</td>
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

        {/* Quotas Tab */}
        {tab === "quotas" && (
          <div className="glass-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-2">Organization Quotas</h3>
            <p className="text-xs text-muted-foreground mb-6">Manage video generation limits per organization.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Daily Seconds Limit", value: "300s", icon: Clock },
                { label: "Monthly Seconds Limit", value: "3,600s", icon: BarChart3 },
                { label: "Concurrent Jobs", value: "3", icon: Server },
              ].map((q) => (
                <div key={q.label} className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <q.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">{q.label}</p>
                  <p className="text-xl font-bold mt-1">{q.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BYO Keys Tab */}
        {tab === "keys" && (
          <div className="glass-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-2">BYO API Key Management</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Organizations can connect their own API keys for supported providers. Keys are encrypted at rest.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <Shield className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Secure Key Storage</p>
                <p className="text-xs text-muted-foreground">All API keys are encrypted using AES-256 and stored in Vault. Only org admins can manage keys.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {providers?.filter((p: any) => p.provider_type === "byo_api" && p.status === "active").map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Plug className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {[p.supports_t2v && "T2V", p.supports_i2v && "I2V", p.supports_a2v && "A2V", p.supports_retake && "Retake"]
                          .filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                    Configure Key
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminVideoProviders;
