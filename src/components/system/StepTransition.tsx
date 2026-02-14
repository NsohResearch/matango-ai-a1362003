import { useNavigate } from "react-router-dom";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { ChevronRight, Check } from "lucide-react";

interface StepTransitionProps {
  /** Override the auto-detected current step */
  stepId?: number;
  /** Custom completion message */
  message?: string;
  /** Whether this step is actually complete (overrides auto-detection) */
  isComplete?: boolean;
}

/**
 * Auto-transition prompt shown at the bottom of each system page.
 * When the current step is complete, it prompts the user to continue.
 */
export default function StepTransition({ stepId, message, isComplete }: StepTransitionProps) {
  const navigate = useNavigate();
  const { steps, currentStepId, statusByStep, nextStepId } = useSystemStatus();

  const activeStepId = stepId ?? currentStepId;
  const complete = isComplete ?? statusByStep[activeStepId] === "complete";
  const next = typeof nextStepId === "number" ? steps.find((s) => s.id === nextStepId) : null;

  if (!complete || !next) return null;

  return (
    <div className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center space-y-3">
      <div className="inline-flex items-center gap-2 text-accent font-medium">
        <Check className="h-5 w-5" />
        <span>{message || `Step ${activeStepId} complete!`}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Ready to continue? Your next step is <span className="font-medium text-foreground">{next.title}</span>.
      </p>
      <button
        onClick={() => navigate(next.route)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Continue to Step {next.id}: {next.title}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
