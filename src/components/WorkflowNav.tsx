import { Link, useLocation } from "react-router-dom";
import { Check, Lock, ChevronRight } from "lucide-react";
import { Brain, Users, FileText, Video, Rocket, Megaphone, Calendar, BarChart3 } from "lucide-react";

export interface WorkflowStep {
  path: string;
  label: string;
  icon: React.ElementType;
  status: "locked" | "ready" | "complete" | "current";
}

const defaultSteps: Omit<WorkflowStep, "status">[] = [
  { path: "/brand-brain", label: "Brand Brain", icon: Brain },
  { path: "/influencer-studio", label: "Influencers", icon: Users },
  { path: "/video-scripts", label: "Scripts", icon: FileText },
  { path: "/video-studio", label: "Video Studio", icon: Video },
  { path: "/aao-studio", label: "AAO Studio", icon: Rocket },
  { path: "/campaign-factory", label: "Campaigns", icon: Megaphone },
  { path: "/schedule", label: "Publish", icon: Calendar },
  { path: "/analytics-hub", label: "Analytics", icon: BarChart3 },
];

interface WorkflowNavProps {
  brandId?: string | null;
  influencerId?: string | null;
  scriptId?: string | null;
}

const WorkflowNav = ({ brandId, influencerId, scriptId }: WorkflowNavProps) => {
  const location = useLocation();

  const currentIndex = defaultSteps.findIndex((s) => location.pathname.startsWith(s.path));

  const steps: WorkflowStep[] = defaultSteps.map((step, i) => {
    let status: WorkflowStep["status"] = "ready";
    if (i === currentIndex) status = "current";
    else if (i < currentIndex) status = "complete";
    return { ...step, status };
  });

  const buildLink = (path: string) => {
    const params = new URLSearchParams();
    if (brandId) params.set("brandId", brandId);
    if (influencerId) params.set("influencerId", influencerId);
    if (scriptId) params.set("scriptId", scriptId);
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  };

  return (
    <div className="w-full overflow-x-auto mb-6">
      <div className="flex items-center gap-1 min-w-max px-1 py-2">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={step.path} className="flex items-center">
              <Link
                to={step.status === "locked" ? "#" : buildLink(step.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  step.status === "current"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : step.status === "complete"
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : step.status === "locked"
                    ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={(e) => step.status === "locked" && e.preventDefault()}
              >
                {step.status === "complete" ? (
                  <Check className="h-3 w-3" />
                ) : step.status === "locked" ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <step.icon className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </Link>
              {!isLast && <ChevronRight className="h-3 w-3 text-muted-foreground/30 mx-0.5 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowNav;
