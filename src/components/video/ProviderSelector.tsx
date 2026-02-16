import { Settings2, ChevronDown, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { useVideoProviders, useProviderModels } from "@/hooks/useVideoProviders";

interface ProviderSelectorProps {
  modality: "t2v" | "i2v" | "a2v" | "retake";
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  selectedTier: string;
  onTierChange: (tier: string) => void;
  plan: string;
}

const ProviderSelector = ({
  modality,
  selectedProvider,
  onProviderChange,
  selectedTier,
  onTierChange,
  plan,
}: ProviderSelectorProps) => {
  const [expanded, setExpanded] = useState(false);
  const { data: providers } = useVideoProviders();
  const { data: models } = useProviderModels();

  const supportKey = `supports_${modality}` as const;
  const availableProviders = providers?.filter(
    (p: any) => p[supportKey] && (p.status === "active" || p.provider_type === "byo_api")
  ) || [];

  const availableModels = models?.filter(
    (m: any) => m.modalities?.includes(modality) && m.quality_tier === selectedTier
  ) || [];

  return (
    <div className="rounded-xl border border-border mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" /> Advanced Options
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Quality Tier */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Generation Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {(["fast", "balanced", "cinematic"] as const).map((tier) => {
                const isCinematic = tier === "cinematic";
                const locked = isCinematic && plan !== "agency" && plan !== "enterprise";
                return (
                  <button
                    key={tier}
                    onClick={() => !locked && onTierChange(tier)}
                    disabled={locked}
                    className={`p-2.5 rounded-lg border text-left transition-all relative ${
                      selectedTier === tier
                        ? isCinematic
                          ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                          : "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : locked
                        ? "border-border/50 opacity-50 cursor-not-allowed"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold capitalize">{tier}</span>
                      {isCinematic && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {tier === "fast" && "Quick preview, lower fidelity"}
                      {tier === "balanced" && "Good quality, reasonable speed"}
                      {tier === "cinematic" && (locked ? "Agency tier required" : "Highest quality, slower render")}
                    </div>
                    {locked && (
                      <Shield className="h-3 w-3 text-muted-foreground absolute top-2 right-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => onProviderChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="auto">Auto (Recommended)</option>
              {availableProviders.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.provider_type === "byo_api" ? "(BYO)" : ""}
                  {p.status === "coming_soon" ? " — Coming Soon" : ""}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Provider auto-selected based on tier, modality & availability.
            </p>
          </div>

          {/* Model info */}
          {selectedProvider !== "auto" && availableModels.length > 0 && (
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Available Models</p>
              {availableModels
                .filter((m: any) =>
                  selectedProvider === "auto" || m.provider_id === selectedProvider || m.video_providers?.id === selectedProvider
                )
                .map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between py-1">
                    <span className="text-xs text-foreground">{m.display_name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {m.max_seconds}s max · {m.max_resolution}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderSelector;
