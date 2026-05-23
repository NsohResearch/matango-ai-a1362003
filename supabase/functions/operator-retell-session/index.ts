// Provisions / updates a Retell agent for a Ka'h deployment and returns an
// access token for a browser web-call test. Bilingual (English + Spanish),
// system prompt assembled from Brand Brain + knowledge + guardrails, and the
// full Ka'h tool registry wired as Retell custom functions pointing back at
// operator-retell-webhook.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RETELL = "https://api.retellai.com";
const GUARDRAILS = `
NEVER offer to waive or absorb a deductible — illegal in TX, FL, CO and 25+ states. Refuse warmly and explain the law.
NEVER quote a license number unless it appears verbatim in the knowledge base.
ALWAYS play the recording disclosure within the first 5 seconds: "Just so you know, this call may be recorded for quality and training purposes."
ALWAYS include "Reply STOP to opt out" on outbound SMS.
NEVER read back credit-card or SSN numbers — send a secure payment link via generate_payment_link.
ESCALATE immediately on: active leak, structural collapse, lawyer/attorney/sue mentions, hostile callers, elderly callers in distress.
`.trim();

const TOOL_SCHEMAS: Record<string, { description: string; parameters: any }> = {
  check_service_area: { description: "Validate caller's address against service area.", parameters: { type: "object", properties: { address: { type: "string" } }, required: ["address"] } },
  check_availability: { description: "List open inspection slots.", parameters: { type: "object", properties: { from: { type: "string", description: "ISO8601" }, to: { type: "string" }, date: { type: "string", description: "YYYY-MM-DD (Acuity)" } } } },
  book_inspection: { description: "Schedule a roof inspection.", parameters: { type: "object", properties: { datetime: { type: "string" }, duration_minutes: { type: "number" }, customer_name: { type: "string" }, phone: { type: "string" }, email: { type: "string" }, address: { type: "string" }, trigger: { type: "string", enum: ["storm", "retail", "leak", "warranty", "maintenance"] }, notes: { type: "string" } }, required: ["datetime", "customer_name", "phone", "address"] } },
  create_lead: { description: "Persist a qualified lead to CRM.", parameters: { type: "object", properties: { name: { type: "string" }, phone: { type: "string" }, address: { type: "string" }, trigger: { type: "string" }, score: { type: "number" }, insurance: { type: "boolean" }, notes: { type: "string" } }, required: ["name", "phone", "address"] } },
  update_lead: { description: "Append notes/tags to a CRM lead.", parameters: { type: "object", properties: { lead_id: { type: "string" }, notes: { type: "string" }, tags: { type: "array", items: { type: "string" } } }, required: ["lead_id"] } },
  send_sms: { description: "Send SMS confirmation or follow-up.", parameters: { type: "object", properties: { to: { type: "string" }, body: { type: "string" } }, required: ["to", "body"] } },
  send_email: { description: "Send transactional email.", parameters: { type: "object", properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } }, required: ["to", "subject", "body"] } },
  lookup_property: { description: "Pull roof sq ft / pitch / year built.", parameters: { type: "object", properties: { address: { type: "string" } }, required: ["address"] } },
  check_storm_data: { description: "Confirm hail/wind history at the address.", parameters: { type: "object", properties: { address: { type: "string" }, date: { type: "string" } }, required: ["address"] } },
  live_transfer: { description: "Warm-transfer the call to a team member.", parameters: { type: "object", properties: { transfer_to: { type: "string" }, reason: { type: "string" } }, required: ["transfer_to"] } },
  send_review_request: { description: "Send a post-job review request.", parameters: { type: "object", properties: { to: { type: "string" }, customer_name: { type: "string" } }, required: ["to"] } },
  generate_payment_link: { description: "Create a deposit or fee payment link.", parameters: { type: "object", properties: { amount: { type: "number" }, description: { type: "string" } }, required: ["amount"] } },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "auth required" }, 401);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: claims } = await sb.auth.getClaims(auth.replace("Bearer ", ""));
    if (!claims?.claims?.sub) return json({ error: "auth required" }, 401);

    const body = await req.json().catch(() => ({}));
    const { deployment_id, action = "sync_agent" } = body as { deployment_id: string; action?: "sync_agent" | "web_call" };
    if (!deployment_id) return json({ error: "deployment_id required" }, 400);

    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: deployment } = await service.from("operator_deployments").select("*").eq("id", deployment_id).maybeSingle();
    if (!deployment) return json({ error: "deployment not found" }, 404);
    if (deployment.user_id !== claims.claims.sub) return json({ error: "forbidden" }, 403);

    const { data: docs } = await service.from("operator_knowledge_docs").select("category,title,content").eq("deployment_id", deployment_id);
    const { data: tools } = await service.from("operator_tools").select("tool_name,is_enabled").eq("deployment_id", deployment_id);

    const grouped: Record<string, string[]> = {};
    for (const d of docs ?? []) {
      grouped[d.category] ??= [];
      if (d.content) grouped[d.category].push(`### ${d.title}\n${d.content}`);
    }
    const knowledge = Object.entries(grouped).map(([cat, items]) => `## ${cat.toUpperCase()}\n${items.join("\n\n")}`).join("\n\n");
    const bilingual = deployment.language_secondary === "es" || deployment.config?.bilingual === true;

    const systemPrompt = [
      `You are Ka'h, an AI receptionist for ${deployment.display_name}.`,
      `Industry: ${deployment.industry_slug}. Primary language: ${deployment.language_primary ?? "en"}.`,
      bilingual ? `BILINGUAL: Detect Spanish vs English in the first turn and respond in the caller's language for the entire call. If unsure, ask "¿Prefiere continuar en español o en inglés?"` : "",
      `Persona: warm, knowledgeable office manager who grew up around the trades.`,
      `Greeting (EN): "Thank you for calling ${deployment.display_name}, this is Ka'h, how can I help you today?"`,
      bilingual ? `Greeting (ES): "Gracias por llamar a ${deployment.display_name}, le habla Ka'h, ¿en qué le puedo ayudar?"` : "",
      `Discovery order: nature of call → address (call check_service_area) → owner vs agent → storm vs wear → insurance status → active leak check → roof age/material → square footage → schedule.`,
      `Qualification: trigger 20% + insurance 20% + service-area 15% + decision-maker 15% + urgency 20% + roof data 10%. ≥75 hot, 50–74 warm, <50 nurture. Active leak overrides everything.`,
      `Tool playbook: ALWAYS call check_service_area before book_inspection. Use check_availability first, propose 2 slots, then book_inspection. After booking, call send_sms with the confirmation and create_lead.`,
      "",
      "GUARDRAILS (non-negotiable):", GUARDRAILS,
      "", "KNOWLEDGE BASE:", knowledge || "(none uploaded yet — ask the caller for missing facts and offer a callback.)",
    ].filter(Boolean).join("\n");

    const retellKey = Deno.env.get("RETELL_API_KEY");
    if (!retellKey) return json({ stub: true, system_prompt: systemPrompt, message: "Add RETELL_API_KEY to provision the live agent." });

    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/operator-retell-webhook`;
    const enabledTools = (tools ?? []).filter((t: any) => t.is_enabled).map((t: any) => t.tool_name);
    const customFunctions = enabledTools
      .filter(n => TOOL_SCHEMAS[n])
      .map(n => ({
        type: "custom",
        name: n,
        description: TOOL_SCHEMAS[n].description,
        url: webhookUrl,
        speak_during_execution: true,
        speak_after_execution: true,
        execution_message_description: "Working on it…",
        parameters: TOOL_SCHEMAS[n].parameters,
      }));

    // 1. Ensure LLM
    let llmId: string | null = deployment.config?.retell_llm_id ?? null;
    const llmPayload = {
      model: "gpt-4o",
      general_prompt: systemPrompt,
      general_tools: customFunctions,
      begin_message: bilingual
        ? `Thank you for calling ${deployment.display_name}, this is Ka'h. Press 2 for Spanish. How can I help you today?`
        : `Thank you for calling ${deployment.display_name}, this is Ka'h, how can I help you today?`,
    };
    if (llmId) {
      const r = await retellCall(`/update-retell-llm/${llmId}`, "PATCH", retellKey, llmPayload);
      if (!r.ok) return json({ error: `retell llm update: ${r.error}` }, 502);
    } else {
      const r = await retellCall(`/create-retell-llm`, "POST", retellKey, llmPayload);
      if (!r.ok) return json({ error: `retell llm create: ${r.error}` }, 502);
      llmId = r.data.llm_id;
    }

    // 2. Ensure Agent
    let agentId: string | null = deployment.config?.retell_agent_id ?? null;
    const agentPayload: any = {
      response_engine: { type: "retell-llm", llm_id: llmId },
      agent_name: `Ka'h — ${deployment.display_name}`,
      voice_id: deployment.voice_id || "11labs-Adrian",
      language: bilingual ? "multi" : (deployment.language_primary === "es" ? "es-US" : "en-US"),
      enable_backchannel: true,
      interruption_sensitivity: 0.8,
      responsiveness: 0.9,
      webhook_url: webhookUrl,
    };
    if (agentId) {
      const r = await retellCall(`/update-agent/${agentId}`, "PATCH", retellKey, agentPayload);
      if (!r.ok) return json({ error: `retell agent update: ${r.error}` }, 502);
    } else {
      const r = await retellCall(`/create-agent`, "POST", retellKey, agentPayload);
      if (!r.ok) return json({ error: `retell agent create: ${r.error}` }, 502);
      agentId = r.data.agent_id;
    }

    // Persist IDs
    await service.from("operator_deployments").update({
      config: { ...(deployment.config ?? {}), retell_llm_id: llmId, retell_agent_id: agentId, bilingual },
    }).eq("id", deployment_id);

    if (action === "web_call") {
      const r = await retellCall(`/v2/create-web-call`, "POST", retellKey, { agent_id: agentId });
      if (!r.ok) return json({ error: `retell web call: ${r.error}` }, 502);
      return json({ ok: true, agent_id: agentId, llm_id: llmId, access_token: r.data.access_token, call_id: r.data.call_id, system_prompt: systemPrompt });
    }

    return json({ ok: true, agent_id: agentId, llm_id: llmId, tools_synced: customFunctions.length, system_prompt: systemPrompt });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

async function retellCall(path: string, method: string, key: string, body: unknown) {
  const res = await fetch(`${RETELL}${path}`, {
    method, headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, error: `${res.status} ${text}` } as const;
  try { return { ok: true, data: JSON.parse(text) } as const; } catch { return { ok: true, data: {} } as const; }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
