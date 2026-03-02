import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRenderCap(videoJobId: string | null) {
  return useQuery({
    queryKey: ["render-cap", videoJobId],
    enabled: !!videoJobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("render_caps")
        .select("final_render_count, max_final_renders")
        .eq("video_job_id", videoJobId!)
        .maybeSingle();

      if (error) throw error;
      const used = data?.final_render_count ?? 0;
      const max = data?.max_final_renders ?? 3;
      return { used, max, remaining: max - used };
    },
  });
}
