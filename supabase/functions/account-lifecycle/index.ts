import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) =>
  console.log(`[ACCOUNT-LIFECYCLE] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Auth failed");
    const user = userData.user;
    log("Authenticated", { userId: user.id });

    const { action, org_id, reason, mode } = await req.json();
    if (!action) throw new Error("Missing action");

    // Get org - use first org if org_id not provided
    let orgId = org_id;
    if (!orgId) {
      const { data: membership } = await supabaseAdmin
        .from("memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      orgId = membership?.organization_id;
    }
    if (!orgId) throw new Error("No organization found");

    // Verify membership
    const { data: isMember } = await supabaseAdmin.rpc("is_org_member", {
      p_user_id: user.id,
      p_org_id: orgId,
    });
    if (!isMember) throw new Error("Not an org member");

    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();
    if (!org) throw new Error("Organization not found");

    // Only owner can perform lifecycle actions
    if (org.owner_id !== user.id) {
      const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { p_user_id: user.id });
      if (!isAdmin) throw new Error("Only org owner or admin can perform lifecycle actions");
    }

    const logEvent = async (eventAction: string, metadata?: unknown) => {
      await supabaseAdmin.from("account_lifecycle_events").insert({
        org_id: orgId,
        actor_user_id: user.id,
        action: eventAction,
        metadata: metadata || {},
      });
    };

    let result: Record<string, unknown> = {};

    switch (action) {
      case "pause": {
        if (org.account_status === "paused") throw new Error("Already paused");
        if (org.account_status === "soft_deleted") throw new Error("Cannot pause a soft-deleted org");
        await supabaseAdmin
          .from("organizations")
          .update({
            account_status: "paused",
            paused_at: new Date().toISOString(),
            paused_reason: reason || null,
          })
          .eq("id", orgId);
        await logEvent("pause", { reason });
        result = { status: "paused", message: "Account paused. Access disabled, data retained." };
        break;
      }

      case "unpause": {
        if (org.account_status !== "paused") throw new Error("Account is not paused");
        await supabaseAdmin
          .from("organizations")
          .update({
            account_status: "active",
            paused_at: null,
            paused_reason: null,
            restored_at: new Date().toISOString(),
          })
          .eq("id", orgId);
        await logEvent("unpause");
        result = { status: "active", message: "Account reactivated." };
        break;
      }

      case "stop_billing": {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) throw new Error("Stripe not configured");
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

        // Find customer
        const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
        if (customers.data.length === 0) throw new Error("No Stripe customer found");
        const customerId = customers.data[0].id;

        // Find active subscription
        const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
        if (subs.data.length === 0) throw new Error("No active subscription found");

        const sub = subs.data[0];
        if (mode === "immediate") {
          await stripe.subscriptions.cancel(sub.id);
        } else {
          await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
        }

        await supabaseAdmin
          .from("organizations")
          .update({ billing_status: "billing_stopped" })
          .eq("id", orgId);
        await logEvent("stop_billing", { mode: mode || "end_of_period", subscription_id: sub.id });
        result = {
          status: "billing_stopped",
          message: mode === "immediate"
            ? "Subscription cancelled immediately."
            : "Subscription will cancel at end of billing period.",
        };
        break;
      }

      case "downgrade": {
        // Set plan to free
        await supabaseAdmin
          .from("organizations")
          .update({ plan: "free" })
          .eq("id", orgId);

        // Also update user profile plan
        await supabaseAdmin
          .from("profiles")
          .update({ plan: "free", credits: 50 })
          .eq("user_id", user.id);

        // Try to cancel Stripe subscription
        try {
          const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
          if (stripeKey) {
            const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
            const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
            if (customers.data.length > 0) {
              const subs = await stripe.subscriptions.list({
                customer: customers.data[0].id,
                status: "active",
                limit: 1,
              });
              if (subs.data.length > 0) {
                await stripe.subscriptions.update(subs.data[0].id, { cancel_at_period_end: true });
              }
            }
          }
        } catch (e) {
          log("Stripe downgrade warning", { error: String(e) });
        }

        await logEvent("downgrade", { from_plan: org.plan, to_plan: "free" });
        result = { status: "downgraded", message: "Downgraded to Free plan. Premium features disabled." };
        break;
      }

      case "soft_delete": {
        if (org.account_status === "soft_deleted") throw new Error("Already soft-deleted");
        const now = new Date();
        const hardDeleteDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

        await supabaseAdmin
          .from("organizations")
          .update({
            account_status: "soft_deleted",
            soft_deleted_at: now.toISOString(),
            hard_delete_at: hardDeleteDate.toISOString(),
            deleted_by_user_id: user.id,
          })
          .eq("id", orgId);

        // Enqueue hard-delete job
        await supabaseAdmin.from("deletion_jobs").insert({
          org_id: orgId,
          status: "queued",
          scheduled_for: hardDeleteDate.toISOString(),
        });

        // Revoke social connections
        await supabaseAdmin
          .from("social_connections")
          .update({ access_token_encrypted: null, refresh_token_encrypted: null })
          .eq("org_id", orgId);

        // Cancel scheduled posts
        await supabaseAdmin
          .from("scheduled_posts")
          .update({ status: "cancelled" })
          .eq("user_id", user.id)
          .eq("status", "scheduled");

        // Try to cancel Stripe
        try {
          const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
          if (stripeKey) {
            const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
            const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
            if (customers.data.length > 0) {
              const subs = await stripe.subscriptions.list({
                customer: customers.data[0].id,
                status: "active",
                limit: 1,
              });
              for (const sub of subs.data) {
                await stripe.subscriptions.cancel(sub.id);
              }
            }
          }
        } catch (e) {
          log("Stripe cancel warning", { error: String(e) });
        }

        await logEvent("soft_delete", { reason, hard_delete_at: hardDeleteDate.toISOString() });
        result = {
          status: "soft_deleted",
          hard_delete_at: hardDeleteDate.toISOString(),
          message: "Account soft-deleted. Restore anytime within 6 months. Permanent deletion after 1 year.",
        };
        break;
      }

      case "restore": {
        if (org.account_status !== "soft_deleted" && org.account_status !== "paused") {
          throw new Error("Account is not in a restorable state");
        }

        // Check 6 month window for soft deletes
        if (org.account_status === "soft_deleted" && org.soft_deleted_at) {
          const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - new Date(org.soft_deleted_at).getTime() > sixMonths) {
            throw new Error("Restore window (6 months) has expired");
          }
        }

        await supabaseAdmin
          .from("organizations")
          .update({
            account_status: "active",
            paused_at: null,
            paused_reason: null,
            soft_deleted_at: null,
            hard_delete_at: null,
            deleted_by_user_id: null,
            restored_at: new Date().toISOString(),
          })
          .eq("id", orgId);

        // Remove queued deletion jobs
        await supabaseAdmin
          .from("deletion_jobs")
          .delete()
          .eq("org_id", orgId)
          .eq("status", "queued");

        await logEvent("restore");
        result = { status: "active", message: "Account restored successfully." };
        break;
      }

      case "get_status": {
        const { data: events } = await supabaseAdmin
          .from("account_lifecycle_events")
          .select("*")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false })
          .limit(10);

        result = {
          account_status: org.account_status,
          billing_status: org.billing_status,
          paused_at: org.paused_at,
          paused_reason: org.paused_reason,
          soft_deleted_at: org.soft_deleted_at,
          hard_delete_at: org.hard_delete_at,
          restored_at: org.restored_at,
          plan: org.plan,
          recent_events: events || [],
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    log("Action completed", { action, result });
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
