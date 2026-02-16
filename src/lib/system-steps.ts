import { Brain, Users, Megaphone, Layers, Video, Library, Zap, Calendar, Settings, Sparkles } from "lucide-react";

export type StepStatus = "locked" | "ready" | "in_progress" | "complete";

export interface SystemStep {
  id: number;
  title: string;
  short: string;
  route: string;
  icon: React.ElementType;
}

export const SYSTEM_STEPS: SystemStep[] = [
  { id: 0, title: "Brand Brain", short: "DNA", route: "/brand-brain", icon: Brain },
  { id: 1, title: "Influencer Studio", short: "Influencer", route: "/influencer-studio", icon: Users },
  { id: 2, title: "Campaign Blueprint", short: "Blueprint", route: "/campaign-factory", icon: Megaphone },
  { id: 3, title: "Campaign Factory", short: "Factory", route: "/video-scripts", icon: Layers },
  { id: 4, title: "Video Studio", short: "Video", route: "/video-studio", icon: Video },
  { id: 5, title: "Asset Gallery", short: "Assets", route: "/asset-library", icon: Library },
  { id: 6, title: "AAO & Automation", short: "AAO", route: "/aao-studio", icon: Zap },
  { id: 7, title: "Publish & Schedule", short: "Publish", route: "/schedule", icon: Calendar },
  { id: 8, title: "Scale & Customize", short: "Scale", route: "/white-label", icon: Settings },
  { id: 9, title: "Meet Ka'h", short: "Ka'h", route: "/meet-kah", icon: Sparkles },
];

/** Determine which step ID corresponds to a given pathname */
export function getStepIdFromPath(pathname: string): number | null {
  const step = SYSTEM_STEPS.find((s) => pathname.startsWith(s.route));
  return step ? step.id : null;
}
