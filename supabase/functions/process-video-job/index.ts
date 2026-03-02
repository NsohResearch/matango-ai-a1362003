import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LTX_BASE = "https://api.freepik.com/v1/ai";
const VEO_BASE = "https://generativelanguage.googleapis.com/v1beta";

// ── Provider submit functions (fire-and-forget — no polling) ──

async function submitLTX(params: Record<string, unknown>, apiKey: string) {
  const endpoint = params.job_type === "text-to-video"
    ? `${LTX_BASE}/text-to-video/ltx-2-pro`
    : `${LTX_BASE}/image-to-video/ltx-2-pro`;

  const resolutionMap: Record<string, string> = { "720p": "1080p", "1080p": "1080p", "1440p": "1440p", "4k": "2160p", "2160p": "2160p" };
  const rawDuration = Number(params.duration) || 6;
  const closestDuration = [6, 8, 10].reduce((prev, curr) => Math.abs(curr - rawDuration) < Math.abs(prev - rawDuration) ? curr : prev);

  const payload: Record<string, unknown> = {
    prompt: params.prompt || "A professional video with smooth motion",
    resolution: resolutionMap[(params.resolution as string)?.toLowerCase() || "1080p"] || "1080p",
    duration: closestDuration,
    fps: 25,
  };
  if (params.job_type !== "text-to-video" && params.resolved_image_url) {
    payload.image_url = params.resolved_image_url;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "x-freepik-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`LTX API error: ${res.status} — ${errBody}`);
  }
  const result = await res.json();
  const taskId = result.data?.task_id || result.task_id;
  if (!taskId) throw new Error("LTX returned no task_id");
  return { providerJobId: taskId, providerName: "ltx" };
}

async function submitVeo(params: Record<string, unknown>, apiKey: string) {
  const model = "veo-2.0-generate-001";
  const instance: Record<string, unknown> = {
    prompt: params.prompt || "A professional video",
  };
  if (params.job_type === "image-to-video" && params.resolved_image_url) {
    instance.image = { imageUri: params.resolved_image_url, mimeType: "image/jpeg" };
  }
  const payload = { instances: [instance], parameters: { aspectRatio: params.aspect_ratio || "16:9" } };

  const res = await fetch(`${VEO_BASE}/models/${model}:predictLongRunning`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Veo API error: ${res.status} — ${errBody}`);
  }
  const result = await res.json();
  const taskId = result.name;
  if (!taskId) throw new Error("Veo returned no operation name");
  return { providerJobId: taskId, providerName: "veo" };
}

async function submitSora(params: Record<string, unknown>, apiKey: string) {
  if (params.job_type === "image-to-video") {
    throw new Error("SORA_NO_I2V");
  }
  const rawDuration = Number(params.duration) || 8;
  const closestDuration = [4, 8, 12].reduce((prev, curr) => Math.abs(curr - rawDuration) < Math.abs(prev - rawDuration) ? curr : prev);
  const sizeMap: Record<string, string> = { "720p": "1280x720", "1080p": "1280x720" };
  const payload = {
    model: (params.model_key as string) || "sora-2",
    prompt: params.prompt || "A cinematic video",
    seconds: String(closestDuration),
    size: sizeMap[(params.resolution as string)?.toLowerCase() || "720p"] || "1280x720",
  };

  const res = await fetch("https://api.openai.com/v1/videos", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Sora API error: ${res.status} — ${errBody}`);
  }
  const result = await res.json();
  if (!result.id) throw new Error("Sora returned no task ID");
  return { providerJobId: result.id, providerName: "openai" };
}

function resolveApiKey(name: string): string | undefined {
  if (name === "ltx") return Deno.env.get("LTX_API_KEY");
  if (name === "sora" || name === "openai" || name === "openai sora") return Deno.env.get("OPENAI_API_KEY");
  if (name === "veo" || name === "google veo") return Deno.env.get("GOOGLE_VEO_API_KEY");
  return undefined;
}

function getSubmitFn(name: string) {
  if (name === "ltx") return submitLTX;
  if (name === "veo" || name === "google veo") return submitVeo;
  if (name === "sora" || name === "openai" || name === "openai sora") return submitSora;
  return submitLTX;
}

/**
 * SUBMIT-AND-RETURN video job processor.
 * Submits to provider, records render_job, returns immediately.
 * Completion polling handled by poll-video-jobs cron function.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, job_id } = body;

    // Health check (no auth)
    if (action === "health-check") {
      return new Response(JSON.stringify({
        status: "ok",
        architecture: "submit-and-return",
        providers: {
          veo: Deno.env.get("GOOGLE_VEO_API_KEY") ? "configured" : "missing",
          ltx: Deno.env.get("LTX_API_KEY") ? "configured" : "missing",
          openai: Deno.env.get("OPENAI_API_KEY") ? "configured" : "missing",
        },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Auth required for all other actions
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

    // Audit helper
    const audit = async (actionName: string, metadata: Record<string, unknown> = {}) => {
      try {
        await supabase.from("video_audit_log").insert({ user_id: user.id, action: actionName, metadata });
      } catch (e) { console.warn("Audit log failed:", e); }
    };

    if (action === "create") {
      const { job_type, script_id, influencer_id, lip_sync, input_refs, prompt,
              duration, resolution, quality_tier, provider_id, is_preview, aspect_ratio } = body;

      const isPreview = is_preview === true;
      const idempotencyKey = `video_${user.id}_${Date.now()}`;

      // 1. Check render caps (skip for preview)
      if (!isPreview) {
        // We'll check caps after creating the video_job
      }

      // 2. Deduct credits atomically
      const creditCost = isPreview
        ? (job_type === "text-to-video" ? 10 : 6)
        : (job_type === "text-to-video" ? 20 : 12);

      const { data: creditResult } = await supabase.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reason: `video_${job_type || "render"}${isPreview ? "_preview" : "_final"}`,
        p_reference_type: "video_job",
        p_idempotency_key: idempotencyKey,
      });

      if (creditResult && !creditResult.success) {
        return new Response(JSON.stringify({
          error: creditResult.error === "insufficient_credits"
            ? `Insufficient credits. Balance: ${creditResult.balance}, Required: ${creditResult.required}`
            : creditResult.error,
          code: creditResult.error,
          balance: creditResult.balance,
        }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // 3. Resolve provider
      let resolvedProviderName = "ltx";
      let resolvedProviderId = provider_id || null;

      if (!resolvedProviderId || resolvedProviderId === "auto") {
        const modality = job_type === "text-to-video" ? "t2v" : "i2v";
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
      } else {
        const { data: provider } = await supabase.from("video_providers").select("name").eq("id", resolvedProviderId).maybeSingle();
        if (provider) resolvedProviderName = provider.name?.toLowerCase() || "ltx";
      }

      const apiKey = resolveApiKey(resolvedProviderName);
      if (!apiKey) {
        // Refund credits
        await supabase.rpc("refund_credits", {
          p_user_id: user.id, p_amount: creditCost,
          p_reason: "provider_unavailable", p_reference_type: "video_job",
        });
        return new Response(JSON.stringify({ error: `Provider "${resolvedProviderName}" not configured.` }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 4. Create video_job record
      const { data: videoJob, error: jobError } = await supabase.from("video_jobs").insert({
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

      // 5. Check render cap for final renders
      if (!isPreview) {
        const { data: capResult } = await supabase.rpc("increment_render_count", { p_job_id: videoJob.id });
        if (capResult === false) {
          // Refund and reject
          await supabase.rpc("refund_credits", {
            p_user_id: user.id, p_amount: creditCost,
            p_reason: "render_cap_exceeded", p_reference_type: "video_job", p_reference_id: videoJob.id,
          });
          await supabase.from("video_jobs").update({ status: "failed", error: "Render cap exceeded" }).eq("id", videoJob.id);
          return new Response(JSON.stringify({ error: "Maximum final renders reached.", code: "render_cap_exceeded" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // 6. Resolve image URL for i2v
      let resolvedImageUrl: string | undefined;
      if (job_type !== "text-to-video") {
        const imageUrl = input_refs?.image_url || input_refs?.source_image;
        if (imageUrl && typeof imageUrl === "string") {
          if (!imageUrl.startsWith("http")) {
            const bucket = input_refs?.bucket || "content";
            const { data: signedData } = await supabase.storage.from(bucket as string).createSignedUrl(imageUrl, 3600);
            resolvedImageUrl = signedData?.signedUrl;
          } else {
            resolvedImageUrl = imageUrl;
          }
        }
      }

      // 7. Submit to provider (with fallback chain)
      let submitResult: { providerJobId: string; providerName: string };
      const submitFn = getSubmitFn(resolvedProviderName);

      try {
        submitResult = await submitFn({
          job_type, prompt, duration, resolution, model_key: body.model_key,
          input_refs, resolved_image_url: resolvedImageUrl, aspect_ratio,
        }, apiKey);
      } catch (submitErr: any) {
        // Fallback chain
        if (submitErr.message === "SORA_NO_I2V" || submitErr.message.includes("API error")) {
          console.log(`Provider ${resolvedProviderName} failed: ${submitErr.message}, trying fallback...`);
          const fallbacks = [
            { name: "ltx", fn: submitLTX, keyEnv: "LTX_API_KEY" },
            { name: "veo", fn: submitVeo, keyEnv: "GOOGLE_VEO_API_KEY" },
          ].filter(f => f.name !== resolvedProviderName);

          let success = false;
          for (const fb of fallbacks) {
            const fbKey = Deno.env.get(fb.keyEnv);
            if (!fbKey) continue;
            try {
              submitResult = await fb.fn({
                job_type, prompt, duration, resolution, model_key: body.model_key,
                input_refs, resolved_image_url: resolvedImageUrl, aspect_ratio,
              }, fbKey);
              await audit("provider_fallback", { from: resolvedProviderName, to: fb.name, reason: submitErr.message });
              success = true;
              break;
            } catch (fbErr: any) {
              console.warn(`Fallback ${fb.name} failed: ${fbErr.message}`);
            }
          }
          if (!success) {
            // Refund credits on total failure
            await supabase.rpc("refund_credits", {
              p_user_id: user.id, p_amount: creditCost,
              p_reason: "all_providers_failed", p_reference_type: "video_job", p_reference_id: videoJob.id,
            });
            await supabase.from("video_jobs").update({ status: "failed", error: "All providers failed" }).eq("id", videoJob.id);
            throw new Error(`All video providers failed. Last: ${submitErr.message}`);
          }
        } else {
          // Refund on unexpected error
          await supabase.rpc("refund_credits", {
            p_user_id: user.id, p_amount: creditCost,
            p_reason: "submit_error", p_reference_type: "video_job", p_reference_id: videoJob.id,
          });
          await supabase.from("video_jobs").update({ status: "failed", error: submitErr.message }).eq("id", videoJob.id);
          throw submitErr;
        }
      }

      // 8. Create render_job record — SUBMIT AND RETURN
      const { data: renderJob, error: renderErr } = await supabase.from("render_jobs").insert({
        user_id: user.id,
        video_job_id: videoJob.id,
        type: job_type === "text-to-video" ? "script_to_video" : "image_to_video",
        status: "submitted",
        progress: 5,
        provider_job_id: submitResult!.providerJobId,
        provider_name: submitResult!.providerName,
        submitted_at: new Date().toISOString(),
        credit_cost: creditCost,
        credit_ledger_id: creditResult?.ledger_id || null,
        quality_tier: quality_tier || "balanced",
        is_preview: isPreview,
        aspect_ratio: aspect_ratio || "16:9",
        params: input_refs || {},
        metadata: { prompt, duration, resolution },
      }).select("id").single();

      if (renderErr) console.error("Failed to create render_job:", renderErr);

      // Update video_job status
      await supabase.from("video_jobs").update({ status: "processing", progress: 5 }).eq("id", videoJob.id);

      await audit("job_submitted", {
        video_job_id: videoJob.id,
        render_job_id: renderJob?.id,
        provider: submitResult!.providerName,
        provider_job_id: submitResult!.providerJobId,
        credit_cost: creditCost,
        is_preview: isPreview,
      });

      // 9. RETURN IMMEDIATELY — no polling, no setTimeout
      return new Response(JSON.stringify({
        video_job_id: videoJob.id,
        render_job_id: renderJob?.id,
        provider: submitResult!.providerName,
        status: "submitted",
        credit_cost: creditCost,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

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
