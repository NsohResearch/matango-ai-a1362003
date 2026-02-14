import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[HARD-DELETE] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    log("Starting hard-delete processor");

    // Find due deletion jobs
    const { data: jobs, error } = await supabaseAdmin
      .from("deletion_jobs")
      .select("*, organizations(*)")
      .eq("status", "queued")
      .lte("scheduled_for", new Date().toISOString())
      .limit(10);

    if (error) throw error;
    if (!jobs || jobs.length === 0) {
      log("No pending deletion jobs");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    for (const job of jobs) {
      const orgId = job.org_id;
      log("Processing hard delete", { orgId, jobId: job.id });

      try {
        await supabaseAdmin
          .from("deletion_jobs")
          .update({ status: "running" })
          .eq("id", job.id);

        // Delete org data in order (respecting FK constraints)
        const tablesToClean = [
          "campaign_assets",
          "campaign_scenes",
          "scheduled_posts",
          "email_sequence_steps",
          "email_sequences",
          "ab_test_variants",
          "ab_tests",
          "landing_pages",
          "social_posts",
          "social_connections",
          "influencer_content",
          "influencer_personas",
          "influencer_settings",
          "collaborators",
          "influencers",
          "video_scenes",
          "video_outputs",
          "video_jobs",
          "video_scripts",
          "asset_versions",
          "edit_sessions",
          "asset_library",
          "unified_campaigns",
          "leads",
          "auto_insights",
          "analytics_data",
          "content_templates",
          "business_dna",
          "white_label_settings",
          "client_workspaces",
          "custom_email_templates",
          "account_lifecycle_events",
        ];

        for (const table of tablesToClean) {
          try {
            // Tables with org_id column
            await supabaseAdmin.from(table).delete().eq("org_id", orgId);
          } catch {
            // Some tables don't have org_id, skip
          }
        }

        // Delete memberships
        await supabaseAdmin.from("memberships").delete().eq("organization_id", orgId);

        // Delete deletion jobs for this org
        await supabaseAdmin.from("deletion_jobs").delete().eq("org_id", orgId).neq("id", job.id);

        // Finally delete the organization
        await supabaseAdmin.from("organizations").delete().eq("id", orgId);

        // Mark job complete
        await supabaseAdmin
          .from("deletion_jobs")
          .update({ status: "succeeded", completed_at: new Date().toISOString() })
          .eq("id", job.id);

        log("Hard delete completed", { orgId });
        processed++;
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        log("Hard delete failed", { orgId, error: errMsg });
        await supabaseAdmin
          .from("deletion_jobs")
          .update({ status: "failed", last_error: errMsg })
          .eq("id", job.id);
      }
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
