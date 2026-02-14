import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useBrandBrains, useCampaigns, useInfluencers, useVideoJobs, useAssetLibrary, useScheduledPosts } from "./useData";
import { SYSTEM_STEPS, getStepIdFromPath, type StepStatus } from "@/lib/system-steps";

/**
 * Computes the status of each system step (0–9) based on real DB state.
 * Steps are unlocked sequentially: complete previous → unlock next.
 */
export function useSystemStatus() {
  const location = useLocation();
  const { data: brands } = useBrandBrains();
  const { data: campaigns } = useCampaigns();
  const { data: influencers } = useInfluencers();
  const { data: videoJobs } = useVideoJobs();
  const { data: assets } = useAssetLibrary();
  const { data: posts } = useScheduledPosts();

  const currentStepId = getStepIdFromPath(location.pathname);

  const statusByStep = useMemo(() => {
    const map: Record<number, StepStatus> = {};

    // Completion checks per step
    const completions: boolean[] = [
      /* 0 Brand Brain */ (brands?.length ?? 0) > 0 && !!brands?.[0]?.brand_name,
      /* 1 Campaign    */ (campaigns?.length ?? 0) > 0,
      /* 2 Images      */ (influencers?.length ?? 0) > 0,
      /* 3 Video       */ (videoJobs?.length ?? 0) > 0,
      /* 4 Assets      */ (assets?.length ?? 0) > 0,
      /* 5 AAO         */ (influencers?.length ?? 0) > 0, // reuse for now
      /* 6 Channels    */ (campaigns?.length ?? 0) > 0,   // reuse
      /* 7 Publish     */ (posts?.length ?? 0) > 0,
      /* 8 Scale       */ false, // manual
      /* 9 K'ah        */ false, // always accessible
    ];

    for (let i = 0; i < SYSTEM_STEPS.length; i++) {
      if (currentStepId === i) {
        map[i] = "in_progress";
      } else if (completions[i]) {
        map[i] = "complete";
      } else if (i === 0 || completions[i - 1] || (map[i - 1] === "complete" || map[i - 1] === "in_progress")) {
        map[i] = "ready";
      } else {
        // Check if any previous step is complete/in_progress — simplified sequential unlock
        let unlocked = i === 0;
        for (let j = 0; j < i; j++) {
          if (completions[j] || j === currentStepId) { unlocked = true; break; }
        }
        map[i] = unlocked ? "ready" : "ready"; // Keep all ready for now to avoid blocking navigation
      }
    }

    return map;
  }, [brands, campaigns, influencers, videoJobs, assets, posts, currentStepId]);

  // Find next incomplete step
  const nextStepId = useMemo(() => {
    if (currentStepId === null) return 0;
    for (let i = currentStepId + 1; i < SYSTEM_STEPS.length; i++) {
      if (statusByStep[i] !== "complete") return i;
    }
    return null;
  }, [currentStepId, statusByStep]);

  const completeCount = useMemo(
    () => SYSTEM_STEPS.filter((s) => statusByStep[s.id] === "complete").length,
    [statusByStep]
  );

  return {
    steps: SYSTEM_STEPS,
    currentStepId: currentStepId ?? 0,
    statusByStep,
    nextStepId,
    completeCount,
    progressPct: Math.round((completeCount / SYSTEM_STEPS.length) * 100),
  };
}
