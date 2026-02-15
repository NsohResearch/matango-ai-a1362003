import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Edge function to process influencer training jobs.
 * Actions: create, status, cancel
 * Replaces Node.js worker with Supabase Edge Function lifecycle.
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
      const { influencer_id, input_media_object_ids, org_id, brand_id } = body;

      if (!influencer_id) {
        return new Response(JSON.stringify({ error: "influencer_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check credits
      const { data: credits } = await supabase.rpc("get_credits_remaining", { p_user_id: user.id });
      if (credits !== null && credits < 10) {
        return new Response(JSON.stringify({ error: "Insufficient credits for training" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create the training job
      const { data: job, error: jobError } = await supabase.from("training_jobs").insert({
        user_id: user.id,
        influencer_id,
        org_id: org_id || null,
        brand_id: brand_id || null,
        input_media_object_ids: input_media_object_ids || [],
        status: "queued",
        progress: 0,
        credit_cost: 15,
      }).select().single();

      if (jobError) throw new Error(jobError.message);

      // Update influencer status to "training"
      await supabase.from("influencers").update({ status: "training" }).eq("id", influencer_id);

      // Track usage
      await supabase.from("usage_events").insert({
        user_id: user.id,
        event_type: "training_start",
        credits_used: 15,
        metadata: { job_id: job.id, influencer_id },
      });

      // Process training asynchronously
      // In production this would call an AI training provider
      // For now: simulate with proper status transitions
      (async () => {
        try {
          await supabase.from("training_jobs").update({
            status: "processing",
            progress: 10,
            started_at: new Date().toISOString(),
          }).eq("id", job.id);

          // Simulate processing stages
          const stages = [
            { progress: 25, delay: 2000 },
            { progress: 50, delay: 3000 },
            { progress: 75, delay: 2000 },
            { progress: 90, delay: 2000 },
          ];

          for (const stage of stages) {
            await new Promise((r) => setTimeout(r, stage.delay));
            await supabase.from("training_jobs").update({
              progress: stage.progress,
            }).eq("id", job.id);
          }

          // Create model registry entry
          const { data: model } = await supabase.from("model_registry").insert({
            user_id: user.id,
            org_id: org_id || null,
            brand_id: brand_id || null,
            provider_model_id: `lovable-${job.id.slice(0, 8)}`,
            name: `influencer-${influencer_id.slice(0, 8)}`,
            type: "lora",
            provider: "lovable-ai",
            status: "active",
            metadata: { training_job_id: job.id, influencer_id },
          }).select().single();

          // Complete the training job
          await supabase.from("training_jobs").update({
            status: "completed",
            progress: 100,
            output_model_registry_id: model?.id || null,
            completed_at: new Date().toISOString(),
            logs: [{ ts: new Date().toISOString(), msg: "Training completed successfully" }],
          }).eq("id", job.id);

          // Update influencer to "trained" with model reference
          await supabase.from("influencers").update({
            status: "trained",
            model_registry_id: model?.id || null,
            stats: {
              trained_at: new Date().toISOString(),
              model_id: model?.id,
              training_images: input_media_object_ids?.length || 0,
            },
          }).eq("id", influencer_id);

        } catch (err) {
          console.error("Training job processing error:", err);
          await supabase.from("training_jobs").update({
            status: "failed",
            error_message: err instanceof Error ? err.message : "Unknown error",
            completed_at: new Date().toISOString(),
          }).eq("id", job.id);

          // Revert influencer status
          await supabase.from("influencers").update({ status: "draft" }).eq("id", influencer_id);
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

      const { data: job, error } = await supabase.from("training_jobs")
        .select("*")
        .eq("id", job_id)
        .eq("user_id", user.id)
        .single();

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "cancel") {
      if (!job_id) {
        return new Response(JSON.stringify({ error: "job_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: job, error } = await supabase.from("training_jobs")
        .update({ status: "cancelled" })
        .eq("id", job_id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Revert influencer status
      if (job?.influencer_id) {
        await supabase.from("influencers").update({ status: "draft" }).eq("id", job.influencer_id);
      }

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'create', 'status', or 'cancel'." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (err) {
    console.error("process-training-job error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
