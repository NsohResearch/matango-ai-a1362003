// Issues an ElevenLabs Conversational Agent token for a Ka'h deployment.
// Assembles the system prompt from Brand Brain + knowledge docs + guardrails
// and returns a single-use token the React client uses with useConversation.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Body { deployment_id: string; language?: "en" | "es"; agent_id?: string }

const GUARDRAILS = `
NEVER offer to waive or absorb a deductible — illegal in TX, FL, CO and 25+ states. If asked, refuse warmly and explain the law.
NEVER quote a license number unless it appears verbatim in the knowledge base.
ALWAYS play the recording disclosure within the first 5 seconds: "Just so you know, this call may be recorded for quality and training purposes."
ALWAYS include "Reply STOP to opt out" on outbound SMS.
NEVER read back credit-card or SSN numbers — instead send a secure payment link via the generate_payment_link tool.
ESCALATE immediately on: active leak, structural collapse, lawyer/attorney/sue mentions, hostile callers, elderly callers in distress.
`.trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "auth required" }, 401);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: claims } = await sb.auth.getUser();
    if (!claims?.user) return json({ error: "auth required" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.deployment_id) return json({ error: "deployment_id required" }, 400);

    const { data: deployment, error: depErr } = await sb
      .from("operator_deployments")
      .select("*")
      .eq("id", body.deployment_id)
      .maybeSingle();
    if (depErr || !deployment) return json({ error: "deployment not found" }, 404);

    const { data: docs } = await sb
      .from("operator_knowledge_docs")
      .select("category,title,content")
      .eq("deployment_id", deployment.id);

    const grouped: Record<string, string[]> = {};
    for (const d of docs ?? []) {
      grouped[d.category] ??= [];
      if (d.content) grouped[d.category].push(`### ${d.title}\n${d.content}`);
    }
    const knowledge = Object.entries(grouped)
      .map(([cat, items]) => `## ${cat.toUpperCase()}\n${items.join("\n\n")}`)
      .join("\n\n");

    const lang = body.language ?? deployment.language_primary ?? "en";
    const systemPrompt = [
      `You are Ka'h, an AI receptionist for ${deployment.display_name}.`,
      `Industry: ${deployment.industry_slug}. Operating language: ${lang}.`,
      `Persona: warm, knowledgeable office manager who grew up around the trades. Confident on insurance claims, precise on roofing terms, fast on scheduling.`,
      `Greeting: "Thank you for calling ${deployment.display_name}, this is Ka'h, how can I help you today?"`,
      `Always run discovery in this order: nature of call → address (run check_service_area) → owner vs agent → storm vs wear → insurance status → active leak check → roof age/material → square footage → schedule.`,
      `Qualification scoring: trigger 20% + insurance 20% + service-area 15% + decision-maker 15% + urgency 20% + roof data 10%. >=75 hot, 50-74 warm, <50 nurture. Active leak overrides everything.`,
      "",
      "GUARDRAILS (non-negotiable):",
      GUARDRAILS,
      "",
      "KNOWLEDGE BASE:",
      knowledge || "(none uploaded yet — answer based on persona; ask the caller for missing facts and offer a callback.)",
    ].join("\n");

    const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");
    const agentId = body.agent_id ?? deployment.config?.elevenlabs_agent_id;
    if (!elevenKey || !agentId) {
      // Surface the assembled prompt + a stub so the UI still demos before keys land.
      return json({ token: null, stub: true, system_prompt: systemPrompt, voice_id: deployment.voice_id });
    }

    const tokenRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
      { headers: { "xi-api-key": elevenKey } },
    );
    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return json({ error: `elevenlabs: ${err}` }, 502);
    }
    const { token } = await tokenRes.json();
    return json({ token, system_prompt: systemPrompt, voice_id: deployment.voice_id, agent_id: agentId });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
