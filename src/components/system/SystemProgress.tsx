import { useNavigate } from "react-router-dom";
import { Check, Lock, Loader2 } from "lucide-react";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { SYSTEM_STEPS, type StepStatus } from "@/lib/system-steps";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const statusClasses: Record<StepStatus, string> = {
  locked: "border-border bg-muted/30 text-muted-foreground/40 cursor-not-allowed",
  ready: "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer",
  in_progress: "border-primary ring-2 ring-primary/30 bg-primary/10 text-primary font-semibold cursor-pointer",
  complete: "border-accent/40 bg-accent/10 text-accent-foreground cursor-pointer",
};

const StatusIcon = ({ status, icon: Icon }: { status: StepStatus; icon: React.ElementType }) => {
  if (status === "complete") return <Check className="h-3.5 w-3.5 text-accent" />;
  if (status === "locked") return <Lock className="h-3 w-3" />;
  if (status === "in_progress") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  return <Icon className="h-3.5 w-3.5" />;
};

export default function SystemProgress() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { steps, currentStepId, statusByStep, nextStepId, progressPct } = useSystemStatus();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const current = steps.find((s) => s.id === currentStepId);
  const next = typeof nextStepId === "number" ? steps.find((s) => s.id === nextStepId) : null;

  const handleNavigate = (stepId: number) => {
    const step = SYSTEM_STEPS[stepId];
    if (!step || statusByStep[stepId] === "locked") return;
    navigate(step.route);
  };

  const handleContinue = () => {
    if (next) navigate(next.route);
  };

  // ── Mobile: collapsed bottom bar ──
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
        {mobileExpanded && (
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 border-b border-border">
            {steps.map((step) => {
              const status = statusByStep[step.id] ?? "ready";
              return (
                <button
                  key={step.id}
                  onClick={() => { handleNavigate(step.id); setMobileExpanded(false); }}
                  className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${statusClasses[status]}`}
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">{step.id}</span>
                  <StatusIcon status={status} icon={step.icon} />
                  <span className="flex-1">{step.title}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => setMobileExpanded(!mobileExpanded)} className="text-xs text-muted-foreground">
            Step {currentStepId} of 9
          </button>
          <Progress value={progressPct} className="flex-1 h-2" />
          <button
            onClick={handleContinue}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── Desktop: persistent top bar ──
  return (
    <div className="w-full border-b border-border bg-card/80 backdrop-blur-sm mb-6">
      <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">
        {/* Left: label + % */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary font-display text-lg font-bold">
            ∞
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">The System</div>
            <div className="text-xs text-muted-foreground">{progressPct}% complete</div>
          </div>
        </div>

        {/* Middle: step chips */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {steps.map((step) => {
              const status = statusByStep[step.id] ?? "ready";
              return (
                <button
                  key={step.id}
                  onClick={() => handleNavigate(step.id)}
                  title={status === "locked" ? "Complete previous step first" : step.title}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${statusClasses[status]}`}
                >
                  <StatusIcon status={status} icon={step.icon} />
                  <span className="hidden xl:inline">{step.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: continue */}
        <div className="flex flex-col items-end gap-1 min-w-[200px]">
          <div className="text-xs text-muted-foreground">
            {next ? (
              <>Next: <span className="text-foreground font-medium">Step {next.id} — {next.title}</span></>
            ) : (
              <span className="text-foreground font-medium">System complete</span>
            )}
          </div>
          <button
            onClick={handleContinue}
            disabled={!next}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Continue →
          </button>
          {current && (
            <div className="text-[11px] text-muted-foreground">
              Current: Step {current.id} — {current.title}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
