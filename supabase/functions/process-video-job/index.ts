import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LTX_BASE = "https://api.ltx.video/v1";

// Provider adapter interface — each provider implements submit/poll/fetch
interface ProviderAdapter {
  submit(params: Record<string, unknown>, apiKey: string): Promise<{ taskId: string }>;
  poll(taskId: string, apiKey: string): Promise<{ status: string; progress: number; videoUrl?: string; error?: string }>;
}

const LTX_ADAPTER: ProviderAdapter = {
  async submit(params, apiKey) {
    const endpoint = params.job_type === "text-to-video" ? `${LTX_BASE}/text-to-video` : `${LTX_BASE}/image-to-video`;
    const resolutionMap: Record<string, string> = {
      "720p": "1280x720", "1080p": "1920x1080", "1440p": "2560x1440", "4k": "3840x2160", "2160p": "3840x2160",
    };
    const rawRes = (params.resolution as string) || "1080p";
    const resolvedResolution = resolutionMap[rawRes.toLowerCase()] || rawRes;

    const payload: Record<string, unknown> = {
      model: (params.model_key as string) || "ltx-2-pro",
      duration: params.duration || 8,
      resolution: resolvedResolution,
    };

    if (params.job_type === "text-to-video") {
      payload.prompt = params.prompt || params.input_refs?.prompt || "A professional product showcase video";
    } else {
      payload.image_uri = params.resolved_image_url;
      payload.prompt = params.prompt || params.input_refs?.prompt || "Animate this image with natural motion";
    }

    console.log(`LTX submit: ${endpoint}`, JSON.stringify(payload));
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`LTX API error: ${res.status} — ${errBody}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const result = await res.json();
      const taskId = result.task_id || result.id;
      if (!taskId) throw new Error("LTX returned JSON but no task_id");
      return { taskId };
    }

    // Synchronous response — return blob as base64 marker
    return { taskId: "__SYNC__:" + await res.text() };
  },

  async poll(taskId, apiKey) {
    const res = await fetch(`${LTX_BASE}/status/${taskId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    if (!res.ok) return { status: "processing", progress: 0 };
    const data = await res.json();
    return {
      status: data.status === "completed" || data.status === "success" ? "completed" : data.status === "failed" || data.status === "error" ? "failed" : "processing",
      progress: data.progress || 0,
      videoUrl: data.video_url || data.output_url,
      error: data.error || data.message,
    };
  },
};

// Adapter registry
const PROVIDER_ADAPTERS: Record<string, ProviderAdapter> = {
  ltx: LTX_ADAPTER,
};

/**
 * Production edge function for video generation with provider routing.
 * Supports text-to-video, image-to-video, and provider-agnostic routing.
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

    const body = await req.json();
    const { action, job_id } = body;

    // ── Audit helper ──
    const audit = async (actionName: string, metadata: Record<string, unknown> = {}) => {
      await supabase.from("video_audit_log").insert({
        user_id: user.id,
        action: actionName,
        metadata: metadata,
      }).catch(() => {});
    };

    if (action === "create") {
      const { job_type, script_id, influencer_id, lip_sync, input_refs, prompt, duration, resolution, quality_tier, provider_id } = body;

      // Check credits
      const { data: credits } = await supabase.rpc("get_credits_remaining", { p_user_id: user.id });
      if (credits !== null && credits < 5) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Resolve provider via routing rules ──
      let resolvedProviderId = provider_id || null;
      let resolvedProviderName = "ltx"; // default fallback
      let resolvedModelKey = "ltx-2-pro";
      let resolvedApiKey = ltxApiKey;

      if (!resolvedProviderId || resolvedProviderId === "auto") {
        // Look up routing rule for modality + quality tier
        const modality = job_type === "text-to-video" ? "t2v" : job_type === "image-to-video" ? "i2v" : job_type === "audio-to-video" ? "a2v" : "t2v";
        const tier = quality_tier || "balanced";

        const { data: rule } = await supabase
          .from("provider_routing_rules")
          .select("*, video_providers(*)")
          .eq("modality", modality)
          .eq("quality_tier", tier)
          .eq("is_active", true)
          .order("priority", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (rule?.primary_provider_id) {
          resolvedProviderId = rule.primary_provider_id;
          resolvedProviderName = rule.video_providers?.name?.toLowerCase() || "ltx";
        }

        await audit("provider_routed", { modality, tier, provider_id: resolvedProviderId, provider_name: resolvedProviderName });
      } else {
        // Specific provider selected — check for BYO key
        const { data: provider } = await supabase
          .from("video_providers")
          .select("*")
          .eq("id", resolvedProviderId)
          .maybeSingle();

        if (provider) {
          resolvedProviderName = provider.name?.toLowerCase() || "ltx";

          if (provider.provider_type === "byo_api") {
            // Look up org-level BYO key
            const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
            const { data: membership } = await supabase.from("memberships").select("organization_id").eq("user_id", user.id).maybeSingle();
            const orgId = membership?.organization_id;

            if (orgId) {
              const { data: orgKey } = await supabase
                .from("org_provider_keys")
                .select("encrypted_secret_ref")
                .eq("org_id", orgId)
                .eq("provider_id", resolvedProviderId)
                .eq("is_active", true)
                .maybeSingle();

              if (orgKey?.encrypted_secret_ref) {
                resolvedApiKey = orgKey.encrypted_secret_ref; // In production, decrypt from vault
              } else {
                return new Response(JSON.stringify({ error: `No API key configured for ${provider.name}. Ask your admin to connect it.` }), {
                  status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
              }
            }
          }
        }
      }

      // Look up model for this provider
      if (resolvedProviderId) {
        const { data: model } = await supabase
          .from("provider_models")
          .select("model_key")
          .eq("provider_id", resolvedProviderId)
          .eq("is_enabled", true)
          .eq("quality_tier", quality_tier || "balanced")
          .maybeSingle();
        if (model?.model_key) resolvedModelKey = model.model_key;
      }

      if (!resolvedApiKey) {
        return new Response(JSON.stringify({ error: "Video provider not configured. API key is missing." }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Quota check ──
      const { data: membership } = await supabase.from("memberships").select("organization_id").eq("user_id", user.id).maybeSingle();
      if (membership?.organization_id) {
        const { data: quota } = await supabase
          .from("video_quotas")
          .select("*")
          .eq("org_id", membership.organization_id)
          .maybeSingle();

        if (quota) {
          if (quota.used_seconds_today >= quota.daily_seconds_limit) {
            return new Response(JSON.stringify({ error: "Daily video generation quota exceeded." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (quota.used_seconds_month >= quota.monthly_seconds_limit) {
            return new Response(JSON.stringify({ error: "Monthly video generation quota exceeded." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (quota.concurrent_jobs_active >= quota.max_concurrent_jobs) {
            return new Response(JSON.stringify({ error: "Maximum concurrent jobs reached. Wait for a job to complete." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
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
        provider_id: resolvedProviderId,
        quality_tier: quality_tier || "balanced",
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
        metadata: { job_id: job.id, job_type, provider: resolvedProviderName, quality_tier: quality_tier || "balanced" },
      });

      await audit("job_created", { job_id: job.id, job_type, provider: resolvedProviderName, quality_tier: quality_tier || "balanced" });

      // ====== PROVIDER ADAPTER CALL ======
      (async () => {
        try {
          await supabase.from("video_jobs").update({ status: "processing", progress: 10 }).eq("id", job.id);
          await supabase.from("render_jobs").update({ status: "processing", progress: 10, started_at: new Date().toISOString() }).eq("video_job_id", job.id);

          // Resolve image URL for i2v
          let resolvedImageUrl: string | undefined;
          if (job_type !== "text-to-video") {
            const imageUrl = input_refs?.image_url || input_refs?.source_image;
            if (imageUrl && !imageUrl.startsWith("http")) {
              const bucket = input_refs?.bucket || "content";
              const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(imageUrl, 3600);
              resolvedImageUrl = signedData?.signedUrl;
              if (!resolvedImageUrl) throw new Error("Failed to resolve source image URL");
            } else {
              resolvedImageUrl = imageUrl;
            }
          }

          // Get adapter
          const adapter = PROVIDER_ADAPTERS[resolvedProviderName] || LTX_ADAPTER;

          const { taskId } = await adapter.submit({
            job_type, prompt, duration, resolution, model_key: resolvedModelKey,
            input_refs, resolved_image_url: resolvedImageUrl,
          }, resolvedApiKey!);

          if (taskId.startsWith("__SYNC__:")) {
            // Synchronous blob response
            const videoBlob = new Blob([taskId.slice(9)], { type: "video/mp4" });
            await supabase.from("video_jobs").update({ progress: 75 }).eq("id", job.id);
            const objectKey = `${user.id}/${job.id}/output.mp4`;
            const { error: uploadError } = await supabase.storage.from("videos").upload(objectKey, videoBlob, { contentType: "video/mp4" });
            if (uploadError) throw new Error(`Failed to store video: ${uploadError.message}`);
            await supabase.from("video_outputs").insert({ video_job_id: job.id, user_id: user.id, status: "completed", url: objectKey });
          } else {
            // Async polling
            await supabase.from("render_jobs").update({ provider_job_id: taskId, progress: 25 }).eq("video_job_id", job.id);
            await supabase.from("video_jobs").update({ progress: 25 }).eq("id", job.id);

            let pollAttempts = 0;
            const maxPolls = 120;
            let completed = false;

            while (pollAttempts < maxPolls && !completed) {
              await new Promise((r) => setTimeout(r, 5000));
              pollAttempts++;

              const result = await adapter.poll(taskId, resolvedApiKey!);
              const mappedProgress = Math.min(90, 25 + Math.round(result.progress * 0.65));
              await supabase.from("video_jobs").update({ progress: mappedProgress }).eq("id", job.id);
              await supabase.from("render_jobs").update({ progress: mappedProgress }).eq("video_job_id", job.id);

              if (result.status === "completed" && result.videoUrl) {
                const videoResponse = await fetch(result.videoUrl);
                if (!videoResponse.ok) throw new Error("Failed to download video");
                const videoBlob = await videoResponse.blob();
                const objectKey = `${user.id}/${job.id}/output.mp4`;
                const { error: uploadError } = await supabase.storage.from("videos").upload(objectKey, videoBlob, { contentType: "video/mp4" });
                if (uploadError) throw new Error(`Failed to store video: ${uploadError.message}`);
                await supabase.from("video_outputs").insert({ video_job_id: job.id, user_id: user.id, status: "completed", url: objectKey });
                completed = true;
              } else if (result.status === "failed") {
                throw new Error(`Provider processing failed: ${result.error || "Unknown error"}`);
              }
            }

            if (!completed) throw new Error("Processing timed out after 10 minutes");
          }

          await supabase.from("video_jobs").update({ status: "completed", progress: 100 }).eq("id", job.id);
          await supabase.from("render_jobs").update({ status: "completed", progress: 100, completed_at: new Date().toISOString() }).eq("video_job_id", job.id);
          await audit("job_completed", { job_id: job.id, provider: resolvedProviderName });
          console.log(`Video job ${job.id} completed via ${resolvedProviderName}`);

        } catch (err) {
          console.error("Video job processing error:", err);
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          await supabase.from("video_jobs").update({ status: "failed", error: errorMsg }).eq("id", job.id);
          await supabase.from("render_jobs").update({ status: "failed", error_message: errorMsg, completed_at: new Date().toISOString() }).eq("video_job_id", job.id);
          await audit("job_failed", { job_id: job.id, error: errorMsg, provider: resolvedProviderName });
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
