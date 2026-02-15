import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LTX_BASE = "https://api.ltx.video/v1";

/**
 * Production edge function for video generation via LTX-2.
 * Supports text-to-video and image-to-video via LTX API.
 * NO simulation — real AI provider calls only.
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
    const ltxApiKey = Deno.env.get("LTX_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ltxApiKey) {
      return new Response(JSON.stringify({ error: "Video provider not configured. LTX_API_KEY is missing." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, job_id } = body;

    if (action === "create") {
      const { job_type, script_id, influencer_id, lip_sync, input_refs, prompt, duration, resolution } = body;

      // Check credits
      const { data: credits } = await supabase.rpc("get_credits_remaining", { p_user_id: user.id });
      if (credits !== null && credits < 5) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create the job record
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

      // Create render_job for tracking
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

      // ====== REAL LTX-2 API CALL ======
      (async () => {
        try {
          // Update to processing
          await supabase.from("video_jobs").update({
            status: "processing",
            progress: 10,
          }).eq("id", job.id);
          await supabase.from("render_jobs").update({
            status: "processing",
            progress: 10,
            started_at: new Date().toISOString(),
          }).eq("video_job_id", job.id);

          // Determine LTX endpoint and payload
          const isTextToVideo = job_type === "text-to-video";
          const ltxEndpoint = isTextToVideo
            ? `${LTX_BASE}/text-to-video`
            : `${LTX_BASE}/image-to-video`;

          const ltxPayload: Record<string, unknown> = {
            model: "ltx-2-pro",
            duration: duration || 8,
            resolution: resolution || "1080p",
          };

          if (isTextToVideo) {
            ltxPayload.prompt = prompt || input_refs?.prompt || "A professional product showcase video";
          } else {
            // Image-to-video: resolve the source image URL
            const imageUrl = input_refs?.image_url || input_refs?.source_image;
            if (!imageUrl) {
              throw new Error("No source image provided for image-to-video generation");
            }

            // If it's a storage path, generate a signed URL for LTX to access
            let resolvedImageUrl = imageUrl;
            if (!imageUrl.startsWith("http")) {
              const bucket = input_refs?.bucket || "content";
              const { data: signedData } = await supabase.storage
                .from(bucket)
                .createSignedUrl(imageUrl, 3600); // 1hr for LTX to download
              if (signedData?.signedUrl) {
                resolvedImageUrl = signedData.signedUrl;
              } else {
                throw new Error("Failed to resolve source image URL");
              }
            }

            ltxPayload.image_uri = resolvedImageUrl;
            ltxPayload.prompt = prompt || input_refs?.prompt || "Animate this image with natural motion";
          }

          console.log(`Calling LTX API: ${ltxEndpoint}`, JSON.stringify(ltxPayload));

          // Submit to LTX-2
          const ltxResponse = await fetch(ltxEndpoint, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${ltxApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(ltxPayload),
          });

          if (!ltxResponse.ok) {
            const errBody = await ltxResponse.text();
            console.error(`LTX API error (${ltxResponse.status}):`, errBody);
            throw new Error(`LTX API error: ${ltxResponse.status} — ${errBody}`);
          }

          // LTX returns video content directly for synchronous calls,
          // or a task_id for async calls. Handle both patterns.
          const contentType = ltxResponse.headers.get("content-type") || "";

          if (contentType.includes("application/json")) {
            // Async mode: LTX returned a task_id for polling
            const ltxResult = await ltxResponse.json();
            const taskId = ltxResult.task_id || ltxResult.id;

            if (!taskId) {
              throw new Error("LTX returned JSON but no task_id");
            }

            // Store provider job ID
            await supabase.from("render_jobs").update({
              provider_job_id: taskId,
              progress: 25,
            }).eq("video_job_id", job.id);
            await supabase.from("video_jobs").update({ progress: 25 }).eq("id", job.id);

            // Poll for completion
            let pollAttempts = 0;
            const maxPolls = 120; // 10 minutes max (5s intervals)
            let completed = false;

            while (pollAttempts < maxPolls && !completed) {
              await new Promise((r) => setTimeout(r, 5000)); // 5s polling interval
              pollAttempts++;

              const statusResponse = await fetch(`${LTX_BASE}/status/${taskId}`, {
                headers: { "Authorization": `Bearer ${ltxApiKey}` },
              });

              if (!statusResponse.ok) {
                console.warn(`LTX status poll failed (attempt ${pollAttempts}):`, statusResponse.status);
                continue;
              }

              const statusData = await statusResponse.json();
              const ltxStatus = statusData.status;
              const ltxProgress = statusData.progress || 0;

              // Update progress
              const mappedProgress = Math.min(90, 25 + Math.round(ltxProgress * 0.65));
              await supabase.from("video_jobs").update({ progress: mappedProgress }).eq("id", job.id);
              await supabase.from("render_jobs").update({ progress: mappedProgress }).eq("video_job_id", job.id);

              if (ltxStatus === "completed" || ltxStatus === "success") {
                const videoUrl = statusData.video_url || statusData.output_url;
                if (videoUrl) {
                  // Download the video and upload to our storage
                  const videoResponse = await fetch(videoUrl);
                  if (!videoResponse.ok) throw new Error("Failed to download video from LTX");
                  const videoBlob = await videoResponse.blob();

                  const objectKey = `${user.id}/${job.id}/output.mp4`;
                  const { error: uploadError } = await supabase.storage
                    .from("videos")
                    .upload(objectKey, videoBlob, { contentType: "video/mp4" });

                  if (uploadError) {
                    console.error("Storage upload error:", uploadError);
                    throw new Error(`Failed to store video: ${uploadError.message}`);
                  }

                  // Create video_output record with storage path (NOT signed URL)
                  await supabase.from("video_outputs").insert({
                    video_job_id: job.id,
                    user_id: user.id,
                    status: "completed",
                    url: objectKey, // storage path only
                  });
                }

                completed = true;
              } else if (ltxStatus === "failed" || ltxStatus === "error") {
                throw new Error(`LTX processing failed: ${statusData.error || statusData.message || "Unknown error"}`);
              }
            }

            if (!completed) {
              throw new Error("LTX processing timed out after 10 minutes");
            }

          } else {
            // Synchronous mode: LTX returned video bytes directly
            const videoBlob = await ltxResponse.blob();

            await supabase.from("video_jobs").update({ progress: 75 }).eq("id", job.id);
            await supabase.from("render_jobs").update({ progress: 75 }).eq("video_job_id", job.id);

            // Upload to storage
            const objectKey = `${user.id}/${job.id}/output.mp4`;
            const { error: uploadError } = await supabase.storage
              .from("videos")
              .upload(objectKey, videoBlob, { contentType: "video/mp4" });

            if (uploadError) throw new Error(`Failed to store video: ${uploadError.message}`);

            // Create video_output record
            await supabase.from("video_outputs").insert({
              video_job_id: job.id,
              user_id: user.id,
              status: "completed",
              url: objectKey,
            });
          }

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

          console.log(`Video job ${job.id} completed successfully via LTX-2`);

        } catch (err) {
          console.error("Video job processing error:", err);
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
