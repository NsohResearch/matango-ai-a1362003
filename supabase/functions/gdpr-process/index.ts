import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { action, request_id } = await req.json();

    if (action === "request_export") {
      // Create export request
      const { data, error } = await supabase.from("gdpr_requests").insert({
        user_id: user.id,
        request_type: "export",
        status: "pending",
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ request: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "request_deletion") {
      const { data, error } = await supabase.from("gdpr_requests").insert({
        user_id: user.id,
        request_type: "deletion",
        status: "pending",
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ request: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "export_data") {
      // Collect all user data across tables
      const tables = [
        "profiles", "business_dna", "influencers", "unified_campaigns", "campaign_assets",
        "scheduled_posts", "video_scripts", "video_jobs", "analytics_data", "analytics_events",
        "leads", "notifications", "social_connections", "asset_library", "aao_activity_log",
        "kah_messages", "ab_tests", "usage_events",
      ];

      const exportData: Record<string, unknown[]> = {};
      for (const table of tables) {
        const { data } = await supabase.from(table).select("*").eq("user_id", user.id);
        if (data && data.length > 0) exportData[table] = data;
      }

      // Update request status
      if (request_id) {
        await supabase.from("gdpr_requests").update({
          status: "completed",
          completed_at: new Date().toISOString(),
        }).eq("id", request_id);
      }

      return new Response(JSON.stringify({ export: exportData, exported_at: new Date().toISOString(), user_email: user.email }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "process_deletion" && request_id) {
      // Admin-only: check role
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin" || r.role === "super_admin");
      if (!isAdmin) return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });

      // Get the request to find target user
      const { data: request } = await supabase.from("gdpr_requests").select("*").eq("id", request_id).single();
      if (!request) return new Response(JSON.stringify({ error: "Request not found" }), { status: 404, headers: corsHeaders });

      // Mark as processing
      await supabase.from("gdpr_requests").update({
        status: "processing",
        processed_at: new Date().toISOString(),
        admin_id: user.id,
      }).eq("id", request_id);

      // Delete user data from all tables (cascade will handle related data)
      const targetUserId = request.user_id;
      const deleteTables = [
        "usage_events", "analytics_events", "analytics_data", "kah_messages",
        "notifications", "aao_activity_log", "scheduled_posts", "campaign_assets",
        "video_jobs", "video_scripts", "leads", "social_connections",
        "asset_library", "influencers", "unified_campaigns", "business_dna",
      ];

      for (const table of deleteTables) {
        await supabase.from(table).delete().eq("user_id", targetUserId);
      }

      // Mark completed
      await supabase.from("gdpr_requests").update({
        status: "completed",
        completed_at: new Date().toISOString(),
      }).eq("id", request_id);

      // Log in audit
      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action: "gdpr_deletion_processed",
        target_id: targetUserId,
        target_type: "user",
        details: { request_id },
      });

      return new Response(JSON.stringify({ success: true, message: "User data deleted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    console.error("GDPR process error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
