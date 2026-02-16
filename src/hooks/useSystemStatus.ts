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

    // Completion checks per step — each checks real DB data
    const completions: boolean[] = [
      /* 0 Brand Brain       */ (brands?.length ?? 0) > 0 && !!brands?.[0]?.brand_name,
      /* 1 Influencer Studio */ (influencers?.length ?? 0) > 0,
      /* 2 Campaign Blueprint*/ (campaigns?.length ?? 0) > 0,
      /* 3 Campaign Factory  */ (campaigns?.length ?? 0) > 0 && (influencers?.length ?? 0) > 0,
      /* 4 Video Studio      */ (videoJobs?.length ?? 0) > 0,
      /* 5 Asset Gallery     */ (assets?.length ?? 0) > 0,
      /* 6 AAO & Automation  */ (brands?.length ?? 0) > 0 && (campaigns?.length ?? 0) > 0,
      /* 7 Publish & Schedule*/ (posts?.length ?? 0) > 0,
      /* 8 Scale & Customize */ false,
      /* 9 Ka'h              */ false,
    ];

    for (let i = 0; i < SYSTEM_STEPS.length; i++) {
      // Step 0 is always unlocked
      const previousComplete = i === 0 ? true : completions[i - 1];
      // Special case: step 9 (Ka'h) is accessible once step 0 is complete
      const isKah = i === 9;
      const isUnlocked = i === 0 || previousComplete || (isKah && completions[0]);

      if (!isUnlocked) {
        map[i] = "locked";
      } else if (currentStepId === i) {
        map[i] = "in_progress";
      } else if (completions[i]) {
        map[i] = "complete";
      } else {
        map[i] = "ready";
      }
    }

    return map;
  }, [brands, campaigns, influencers, videoJobs, assets, posts, currentStepId]);

  // Find next incomplete step that is unlocked
  const nextStepId = useMemo(() => {
    if (currentStepId === null) return 0;
    for (let i = currentStepId + 1; i < SYSTEM_STEPS.length; i++) {
      if (statusByStep[i] !== "complete" && statusByStep[i] !== "locked") return i;
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
