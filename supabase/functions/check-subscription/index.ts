import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false, plan: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Check active, past_due, or trialing subscriptions
    let subscriptions;
    try {
      subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 10 });
    } catch (stripeErr) {
      logStep("Stripe subscription list error, falling back to profile", { error: String(stripeErr) });
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("plan")
        .eq("user_id", user.id)
        .single();
      const profilePlan = profile?.plan || "free";
      return new Response(JSON.stringify({ subscribed: profilePlan !== "free", plan: profilePlan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const activeSub = subscriptions.data.find(s => s.status === "active" || s.status === "past_due" || s.status === "trialing");
    
    if (!activeSub) {
      logStep("No active subscription in Stripe, checking profile override");
      // Fall back to profile plan (supports manual overrides)
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("plan")
        .eq("user_id", user.id)
        .single();
      const profilePlan = profile?.plan || "free";
      const isOverridden = profilePlan !== "free";
      logStep("Profile plan fallback", { profilePlan, isOverridden });
      return new Response(JSON.stringify({ 
        subscribed: isOverridden, 
        plan: profilePlan 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sub = activeSub;
    const productId = sub.items.data[0].price.product as string;
    let subscriptionEnd: string | null = null;
    try {
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
    } catch {
      logStep("Could not parse subscription end date", { raw: sub.current_period_end });
    }
    logStep("Found subscription", { productId, subscriptionEnd, status: sub.status });

    // Map product IDs to plan names
    const PRODUCT_MAP: Record<string, string> = {
      "prod_TyZk4lrpOZD0eE": "basic",
      "prod_TyZkDIfLRosrEY": "agency",
    };
    const plan = PRODUCT_MAP[productId] || "basic";

    // Sync plan to profiles table
    await supabaseClient.from("profiles").update({ plan }).eq("user_id", user.id);
    logStep("Synced plan to profile", { plan });

    return new Response(JSON.stringify({
      subscribed: true,
      plan,
      product_id: productId,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
