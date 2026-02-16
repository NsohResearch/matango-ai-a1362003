import { Clapperboard, Lock, Sparkles } from "lucide-react";

interface AIDirectorToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  plan: string;
  scenes?: { prompt: string; duration: number; camera: string }[];
}

const AIDirectorToggle = ({ enabled, onToggle, plan, scenes }: AIDirectorToggleProps) => {
  const locked = plan !== "agency" && plan !== "enterprise";

  return (
    <div className="rounded-xl border border-border mt-4 overflow-hidden">
      <button
        onClick={() => !locked && onToggle(!enabled)}
        disabled={locked}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
          enabled
            ? "bg-accent/10 text-foreground border-b border-accent/20"
            : locked
            ? "text-muted-foreground/60 cursor-not-allowed"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="flex items-center gap-2">
          <Clapperboard className="h-4 w-4" />
          AI Director Mode
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">
            Agency
          </span>
        </span>
        {locked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <div className={`w-9 h-5 rounded-full transition-colors ${enabled ? "bg-accent" : "bg-muted"} relative`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${enabled ? "left-4.5 translate-x-0" : "left-0.5"}`}
              style={{ left: enabled ? "18px" : "2px" }} />
          </div>
        )}
      </button>

      {enabled && !locked && (
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            AI Director will analyze your prompt and automatically break it into optimized scenes with camera movements, transitions, and timing.
          </p>
          {scenes && scenes.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shot List</h5>
              {scenes.map((scene, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50 border border-border">
                  <span className="text-[10px] font-bold text-accent w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{scene.prompt}</p>
                    <p className="text-[10px] text-muted-foreground">{scene.duration}s · {scene.camera}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!scenes || scenes.length === 0) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <Sparkles className="h-4 w-4 text-accent shrink-0" />
              <p className="text-xs text-muted-foreground">Enter a prompt above and AI Director will generate a shot list automatically.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIDirectorToggle;
