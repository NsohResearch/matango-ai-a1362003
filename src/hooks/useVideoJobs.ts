import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { callEdgeFunction } from "@/lib/edge-functions";

/**
 * Submit a video job — returns immediately with render_job_id.
 * No synchronous polling. Status tracked via useRenderJobStatus.
 */
export function useCreateVideoJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      job_type: "image-to-video" | "text-to-video";
      prompt?: string;
      duration?: number;
      resolution?: string;
      quality_tier?: string;
      input_refs?: Record<string, unknown>;
      provider_id?: string;
      influencer_id?: string;
      is_preview?: boolean;
    }) => {
      return callEdgeFunction("process-video-job", {
        action: "create",
        ...params,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["render-jobs"] });
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

/**
 * Poll render_jobs for status updates.
 * Stops polling when job is completed or failed.
 */
export function useRenderJobStatus(renderJobId: string | null) {
  return useQuery({
    queryKey: ["render-job-status", renderJobId],
    enabled: !!renderJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") return false;
      return 5000; // poll every 5s while in progress
    },
    queryFn: async () => {
      const { data, error } = await supabase
        .from("render_jobs")
        .select("*")
        .eq("id", renderJobId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * List user's recent render jobs.
 */
export function useRenderJobs(limit = 20) {
  return useQuery({
    queryKey: ["render-jobs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("render_jobs")
        .select("*, video_jobs(*)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}
