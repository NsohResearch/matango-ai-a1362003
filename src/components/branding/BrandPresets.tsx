import { Palette } from "lucide-react";

export interface BrandPreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  font: string;
}

export const BRAND_PRESETS: BrandPreset[] = [
  { id: "emerald-luxe", name: "Emerald Luxe", primary: "#1B6B4A", secondary: "#0A2E1F", accent: "#C6A14A", font: "Cormorant Garamond" },
  { id: "minimal-white", name: "Minimal White", primary: "#111111", secondary: "#FAFAFA", accent: "#3B82F6", font: "Inter" },
  { id: "midnight-noir", name: "Midnight Noir", primary: "#1E1E2E", secondary: "#0D0D14", accent: "#A78BFA", font: "Montserrat" },
];

interface Props {
  onSelect: (preset: BrandPreset) => void;
  activeId?: string;
}

export default function BrandPresets({ onSelect, activeId }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Quick Presets</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {BRAND_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            className={`group relative rounded-xl border-2 p-3 text-left transition-all ${
              activeId === p.id
                ? "border-gold-400 bg-gold-400/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex gap-1.5 mb-2">
              <div className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: p.primary }} />
              <div className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: p.secondary }} />
              <div className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: p.accent }} />
            </div>
            <div className="text-xs font-semibold text-foreground">{p.name}</div>
            <div className="text-[10px] text-muted-foreground">{p.font}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
