import { validateBrandPalette, suggestColorForContrast } from "@/lib/branding/contrast";
import { AlertTriangle } from "lucide-react";

interface Props {
  primary: string;
  accent: string;
  background?: string;
  foreground?: string;
  onPatch: (patch: { primary_color?: string; accent_color?: string }) => void;
}

export default function ContrastWarnings({
  primary,
  accent,
  background = "#0A2E1F",
  foreground = "#F5F3EE",
  onPatch,
}: Props) {
  const res = validateBrandPalette({ primary, accent, background, foreground });
  if (res.ok) return null;

  const suggestion = suggestColorForContrast({ fgHex: primary, bgHex: background });

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" />
        Contrast warning
      </div>
      <ul className="mt-2 list-disc pl-5 text-xs text-amber-300/80">
        {res.failures.map((f) => (
          <li key={f.name}>
            {f.name}: ratio {f.ratio.toFixed(2)} (recommended ≥ {f.mode === "large" ? "3.0" : "4.5"})
          </li>
        ))}
      </ul>

      {suggestion.ok && suggestion.suggestedHex !== primary && (
        <button
          type="button"
          className="mt-3 rounded-lg border border-amber-500/30 bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:border-gold-400/60 transition-colors"
          onClick={() => onPatch({ primary_color: suggestion.suggestedHex })}
        >
          Auto-fix primary → {suggestion.suggestedHex}
        </button>
      )}
    </div>
  );
}
