import { Brain, Megaphone, ImagePlus, Video, Library, Users, Layers, Calendar, Settings, Sparkles } from "lucide-react";

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
  { id: 1, title: "Campaign Blueprint", short: "Campaign", route: "/campaign-factory", icon: Megaphone },
  { id: 2, title: "Image & Training", short: "Images", route: "/influencer-studio", icon: ImagePlus },
  { id: 3, title: "Video Studio", short: "Video", route: "/video-studio", icon: Video },
  { id: 4, title: "Asset Library", short: "Assets", route: "/asset-library", icon: Library },
  { id: 5, title: "AAO & Influencers", short: "AAO", route: "/aao-studio", icon: Users },
  { id: 6, title: "Campaign Factory", short: "Channels", route: "/video-scripts", icon: Layers },
  { id: 7, title: "Publish & Schedule", short: "Publish", route: "/schedule", icon: Calendar },
  { id: 8, title: "Scale & Customize", short: "Scale", route: "/white-label", icon: Settings },
  { id: 9, title: "Meet K'ah", short: "K'ah", route: "/meet-kah", icon: Sparkles },
];

/** Determine which step ID corresponds to a given pathname */
export function getStepIdFromPath(pathname: string): number | null {
  const step = SYSTEM_STEPS.find((s) => pathname.startsWith(s.route));
  return step ? step.id : null;
}
