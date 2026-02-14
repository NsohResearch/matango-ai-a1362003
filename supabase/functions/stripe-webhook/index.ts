import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey) {
    logStep("ERROR", { message: "STRIPE_SECRET_KEY not set" });
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const sig = req.headers.get("stripe-signature");
      if (!sig) throw new Error("Missing stripe-signature header");
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      logStep("Signature verified", { type: event.type });
    } else {
      event = JSON.parse(body) as Stripe.Event;
      logStep("No webhook secret — parsing raw event", { type: event.type });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { customerId: session.customer, email: session.customer_email });

        // Find user by email and update plan
        const email = session.customer_details?.email || session.customer_email;
        if (email) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("user_id")
            .eq("email", email)
            .single();
          if (profile) {
            await supabaseAdmin
              .from("profiles")
              .update({ plan: "basic" })
              .eq("user_id", profile.user_id);
            logStep("Profile updated to basic", { userId: profile.user_id });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { status: sub.status, customerId: sub.customer });

        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        if (customer.email) {
          const plan = sub.status === "active" ? "basic" : "free";
          await supabaseAdmin
            .from("profiles")
            .update({ plan })
            .eq("email", customer.email);
          logStep("Profile plan synced", { email: customer.email, plan });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { customerId: sub.customer });

        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        if (customer.email) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan: "free" })
            .eq("email", customer.email);
          logStep("Downgraded to free", { email: customer.email });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { customerId: invoice.customer, invoiceId: invoice.id });

        const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
        if (customer.email) {
          // Create notification for user
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("user_id")
            .eq("email", customer.email)
            .single();
          if (profile) {
            await supabaseAdmin.from("notifications").insert({
              user_id: profile.user_id,
              type: "billing",
              title: "Payment Failed",
              message: "Your latest payment failed. Please update your payment method to continue using premium features.",
            });
            logStep("Payment failure notification sent", { userId: profile.user_id });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
