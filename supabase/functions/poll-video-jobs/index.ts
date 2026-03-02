import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Cron-triggered function: polls pending video render jobs against provider APIs.
 * Runs every 30 seconds. NO user auth required (service role only).
 */

interface PollResult {
  status: "processing" | "completed" | "failed";
  progress: number;
  videoUrl?: string;
  error?: string;
}

async function pollLTX(providerJobId: string, apiKey: string): Promise<PollResult> {
  // Try i2v endpoint first, then t2v
  for (const endpoint of [
    `https://api.freepik.com/v1/ai/image-to-video/ltx-2-pro/${providerJobId}`,
    `https://api.freepik.com/v1/ai/text-to-video/ltx-2-pro/${providerJobId}`,
  ]) {
    const res = await fetch(endpoint, {
      headers: { "x-freepik-api-key": apiKey },
    });
    if (!res.ok) continue;
    const data = await res.json();
    const status = data.data?.status?.toUpperCase();
    if (status === "COMPLETED") {
      return { status: "completed", progress: 100, videoUrl: data.data?.generated?.[0] };
    }
    if (status === "FAILED") {
      return { status: "failed", progress: 0, error: data.data?.error || "LTX generation failed" };
    }
    return { status: "processing", progress: 50 };
  }
  return { status: "processing", progress: 0 };
}

async function pollVeo(providerJobId: string, apiKey: string): Promise<PollResult> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${providerJobId}`, {
    headers: { "x-goog-api-key": apiKey },
  });
  if (!res.ok) return { status: "processing", progress: 0 };
  const data = await res.json();
  if (data.done === true) {
    if (data.error) return { status: "failed", progress: 0, error: data.error.message };
    const videoUri = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    return { status: "completed", progress: 100, videoUrl: videoUri ? `${videoUri}&key=${apiKey}` : undefined };
  }
  return { status: "processing", progress: data.metadata?.percentComplete ?? 50 };
}

async function pollSora(providerJobId: string, apiKey: string): Promise<PollResult> {
  const res = await fetch(`https://api.openai.com/v1/videos/${providerJobId}`, {
    headers: { "Authorization": `Bearer ${apiKey}` },
  });
  if (!res.ok) return { status: "processing", progress: 0 };
  const data = await res.json();
  if (data.status === "completed") {
    return {
      status: "completed",
      progress: 100,
      videoUrl: `https://api.openai.com/v1/videos/${providerJobId}/content`,
    };
  }
  if (data.status === "failed") {
    return { status: "failed", progress: 0, error: data.error?.message };
  }
  return { status: "processing", progress: data.progress ?? 50 };
}

function resolveApiKey(providerName: string): string | undefined {
  const name = providerName?.toLowerCase() || "";
  if (name.includes("ltx")) return Deno.env.get("LTX_API_KEY");
  if (name.includes("veo") || name.includes("google")) return Deno.env.get("GOOGLE_VEO_API_KEY");
  if (name.includes("sora") || name.includes("openai")) return Deno.env.get("OPENAI_API_KEY");
  return undefined;
}

function getPollFn(providerName: string) {
  const name = providerName?.toLowerCase() || "";
  if (name.includes("ltx")) return pollLTX;
  if (name.includes("veo") || name.includes("google")) return pollVeo;
  if (name.includes("sora") || name.includes("openai")) return pollSora;
  return pollLTX; // default
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Fetch pending/submitted/processing jobs
    const { data: jobs, error } = await supabase
      .from("render_jobs")
      .select("id, provider_job_id, provider_name, video_job_id, user_id, retry_count, max_retries, credit_cost, status")
      .in("status", ["submitted", "processing"])
      .order("submitted_at", { ascending: true })
      .limit(20);

    if (error) throw error;

    // 2. Also pick up retry-scheduled jobs
    const { data: retryJobs } = await supabase
      .from("render_jobs")
      .select("id, provider_job_id, provider_name, video_job_id, user_id, retry_count, max_retries, credit_cost, status")
      .eq("status", "retry_scheduled")
      .lte("next_retry_at", new Date().toISOString())
      .limit(10);

    const allJobs = [...(jobs || []), ...(retryJobs || [])];
    
    let processed = 0;
    let completed = 0;
    let failed = 0;

    for (const job of allJobs) {
      if (!job.provider_job_id || !job.provider_name) continue;

      const apiKey = resolveApiKey(job.provider_name);
      if (!apiKey) continue;

      const pollFn = getPollFn(job.provider_name);
      
      try {
        const result = await pollFn(job.provider_job_id, apiKey);
        processed++;

        if (result.status === "completed" && result.videoUrl) {
          // Download video from provider
          const downloadHeaders: Record<string, string> = {};
          if (job.provider_name?.toLowerCase().includes("sora") || job.provider_name?.toLowerCase().includes("openai")) {
            downloadHeaders["Authorization"] = `Bearer ${apiKey}`;
          }

          const videoRes = await fetch(result.videoUrl, { headers: downloadHeaders });
          if (!videoRes.ok) {
            console.error(`Failed to download video for job ${job.id}: ${videoRes.status}`);
            continue;
          }

          const videoBlob = await videoRes.blob();
          const objectKey = `${job.user_id}/${job.video_job_id || job.id}/output.mp4`;

          // Upload to storage
          const { error: uploadErr } = await supabase.storage
            .from("videos")
            .upload(objectKey, videoBlob, { contentType: "video/mp4", upsert: true });
          
          if (uploadErr) {
            console.error(`Storage upload failed for job ${job.id}:`, uploadErr);
            continue;
          }

          // Create media_object
          const { data: mo } = await supabase.from("media_objects").insert({
            user_id: job.user_id,
            bucket: "videos",
            object_key: objectKey,
            mime_type: "video/mp4",
            size_bytes: videoBlob.size,
            type: "video",
          }).select("id").single();

          // Update render_job
          await supabase.from("render_jobs").update({
            status: "completed",
            progress: 100,
            output_media_object_id: mo?.id || null,
            completed_at: new Date().toISOString(),
          }).eq("id", job.id);

          // Update video_job
          if (job.video_job_id) {
            await supabase.from("video_jobs").update({ status: "completed", progress: 100 }).eq("id", job.video_job_id);
            
            // Create video_output
            await supabase.from("video_outputs").insert({
              video_job_id: job.video_job_id,
              user_id: job.user_id,
              status: "completed",
              url: objectKey,
              media_object_id: mo?.id || null,
            });
          }

          // Audit
          await supabase.from("video_audit_log").insert({
            user_id: job.user_id,
            action: "job_completed_by_poller",
            metadata: { render_job_id: job.id, provider: job.provider_name },
          }).then(() => {}).catch(() => {});

          completed++;
          console.log(`Job ${job.id} completed via ${job.provider_name}`);

        } else if (result.status === "failed") {
          const retryCount = (job.retry_count || 0) + 1;
          const maxRetries = job.max_retries || 3;

          if (retryCount < maxRetries) {
            // Schedule retry with exponential backoff
            const backoffMs = Math.pow(2, retryCount) * 30000; // 60s, 120s, 240s
            await supabase.from("render_jobs").update({
              status: "retry_scheduled",
              retry_count: retryCount,
              next_retry_at: new Date(Date.now() + backoffMs).toISOString(),
              error_message: result.error,
            }).eq("id", job.id);
          } else {
            // Final failure — refund credits
            await supabase.from("render_jobs").update({
              status: "failed",
              error_message: result.error,
              failed_at: new Date().toISOString(),
            }).eq("id", job.id);

            if (job.video_job_id) {
              await supabase.from("video_jobs").update({
                status: "failed",
                error: result.error,
              }).eq("id", job.video_job_id);
            }

            // Refund credits
            if (job.credit_cost && job.credit_cost > 0) {
              await supabase.rpc("refund_credits", {
                p_user_id: job.user_id,
                p_amount: job.credit_cost,
                p_reason: "video_render_failed",
                p_reference_type: "render_job",
                p_reference_id: job.id,
              });
            }

            failed++;
          }

          console.log(`Job ${job.id} failed (retry ${retryCount}/${maxRetries}): ${result.error}`);

        } else {
          // Still processing — update progress
          await supabase.from("render_jobs").update({
            status: "processing",
            progress: result.progress,
          }).eq("id", job.id);

          if (job.video_job_id) {
            await supabase.from("video_jobs").update({ progress: result.progress }).eq("id", job.video_job_id);
          }
        }
      } catch (pollErr) {
        console.error(`Error polling job ${job.id}:`, pollErr);
      }
    }

    return new Response(JSON.stringify({
      processed,
      completed,
      failed,
      total: allJobs.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("poll-video-jobs error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
