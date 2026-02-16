import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_PLANS = ["free", "basic", "agency", "enterprise"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Authenticate admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Auth failed");
    const adminId = userData.user.id;

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", adminId)
      .single();
    if (!adminProfile || !["admin", "super_admin"].includes(adminProfile.role)) {
      throw new Error("Forbidden: admin role required");
    }

    const body = await req.json();
    const { action, target_user_id, plan, credits, note } = body;

    if (!target_user_id) throw new Error("target_user_id required");

    // Verify target user exists
    const { data: targetProfile, error: tErr } = await supabase
      .from("profiles")
      .select("user_id, plan, credits, email, name")
      .eq("user_id", target_user_id)
      .single();
    if (tErr || !targetProfile) throw new Error("Target user not found");

    let result: any = { success: true };

    if (action === "set_plan") {
      if (!plan || !VALID_PLANS.includes(plan)) throw new Error("Invalid plan: " + plan);

      const oldPlan = targetProfile.plan;
      const { error } = await supabase
        .from("profiles")
        .update({ plan, updated_at: new Date().toISOString() })
        .eq("user_id", target_user_id);
      if (error) throw error;

      // Audit log
      await supabase.from("admin_audit_log").insert({
        admin_id: adminId,
        action: "set_plan",
        target_type: "user",
        target_id: target_user_id,
        details: { old_plan: oldPlan, new_plan: plan, note },
      });

      result = { success: true, old_plan: oldPlan, new_plan: plan };

    } else if (action === "grant_credits" || action === "deduct_credits") {
      const delta = action === "grant_credits" ? Math.abs(credits || 0) : -Math.abs(credits || 0);
      if (delta === 0) throw new Error("credits must be non-zero");

      const newCredits = Math.max(0, (targetProfile.credits || 0) + delta);

      const { error } = await supabase
        .from("profiles")
        .update({ credits: newCredits, updated_at: new Date().toISOString() })
        .eq("user_id", target_user_id);
      if (error) throw error;

      // Credit ledger entry
      await supabase.from("credit_ledger").insert({
        user_id: target_user_id,
        delta,
        reason: action === "grant_credits" ? "admin_grant" : "admin_deduct",
        note: note || null,
        admin_id: adminId,
      });

      // Audit log
      await supabase.from("admin_audit_log").insert({
        admin_id: adminId,
        action,
        target_type: "user",
        target_id: target_user_id,
        details: { delta, new_credits: newCredits, note },
      });

      result = { success: true, delta, new_credits: newCredits };

    } else {
      throw new Error("Unknown action: " + action);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[admin-manage-user] ERROR:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
