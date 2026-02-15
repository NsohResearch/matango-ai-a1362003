import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Edge function to process video jobs.
 * Replaces the setTimeout simulation with proper job lifecycle:
 * - Validates the job request
 * - Creates the job with "queued" status
 * - Simulates processing (will be replaced with real AI provider later)
 * - Updates status to "completed" with proper tracking
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, job_id } = body;

    if (action === "create") {
      const { job_type, script_id, influencer_id, lip_sync, input_refs } = body;

      // Check credits
      const { data: credits } = await supabase.rpc("get_credits_remaining", { p_user_id: user.id });
      if (credits !== null && credits < 5) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create the job
      const { data: job, error: jobError } = await supabase.from("video_jobs").insert({
        user_id: user.id,
        job_type: job_type || "image-to-video",
        script_id: script_id || null,
        influencer_id: influencer_id || null,
        lip_sync: lip_sync || false,
        input_refs: input_refs || {},
        status: "queued",
        progress: 0,
      }).select().single();

      if (jobError) throw new Error(jobError.message);

      // Create render_job for proper tracking
      const renderType = job_type === "text-to-video" ? "script_to_video" : "image_to_video";
      await supabase.from("render_jobs").insert({
        user_id: user.id,
        video_job_id: job.id,
        type: renderType,
        status: "queued",
        progress: 0,
        params: input_refs || {},
      });

      // Track usage
      const creditCost = job_type === "text-to-video" ? 20 : 12;
      await supabase.from("usage_events").insert({
        user_id: user.id,
        event_type: `video_${job_type || "render"}`,
        credits_used: creditCost,
        metadata: { job_id: job.id, job_type },
      });

      // Process the job asynchronously
      // In production, this would call an AI video provider
      // For now, we simulate processing with proper status updates
      (async () => {
        try {
          // Update to processing
          await supabase.from("video_jobs").update({
            status: "processing",
            progress: 25,
          }).eq("id", job.id);

          await supabase.from("render_jobs").update({
            status: "processing",
            progress: 25,
            started_at: new Date().toISOString(),
          }).eq("video_job_id", job.id);

          // Simulate AI processing time
          await new Promise((resolve) => setTimeout(resolve, 5000));

          await supabase.from("video_jobs").update({ progress: 75 }).eq("id", job.id);
          await supabase.from("render_jobs").update({ progress: 75 }).eq("video_job_id", job.id);

          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Complete the job
          await supabase.from("video_jobs").update({
            status: "completed",
            progress: 100,
          }).eq("id", job.id);

          await supabase.from("render_jobs").update({
            status: "completed",
            progress: 100,
            completed_at: new Date().toISOString(),
          }).eq("video_job_id", job.id);

          // Update linked video outputs
          await supabase.from("video_outputs").update({
            status: "completed",
          }).eq("video_job_id", job.id);

        } catch (err) {
          console.error("Job processing error:", err);
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          await supabase.from("video_jobs").update({
            status: "failed",
            error: errorMsg,
          }).eq("id", job.id);
          await supabase.from("render_jobs").update({
            status: "failed",
            error_message: errorMsg,
            completed_at: new Date().toISOString(),
          }).eq("video_job_id", job.id);
        }
      })();

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "status") {
      if (!job_id) {
        return new Response(JSON.stringify({ error: "job_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: job, error } = await supabase.from("video_jobs")
        .select("*")
        .eq("id", job_id)
        .eq("user_id", user.id)
        .single();

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'create' or 'status'." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (err) {
    console.error("process-video-job error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
