// Ka'h tool registry — single dispatcher for every operator tool call.
// Each adapter is a stub today and returns a typed mock response so the voice
// agent can run end-to-end. Real provider wiring slots in by replacing the
// body of the named handler.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface ToolRequest {
  deployment_id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  call_sid?: string;
}

interface ToolResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
  provider?: string;
  stub?: boolean;
}

type Handler = (args: Record<string, unknown>, ctx: { provider: string; config: Record<string, unknown> }) => Promise<ToolResponse>;

const HANDLERS: Record<string, Handler> = {
  async book_inspection(args, { provider }) {
    return { ok: true, stub: true, provider, data: { confirmation_id: `INS-${Date.now()}`, datetime: args.datetime, calendar_link: null } };
  },
  async check_availability(args, { provider }) {
    const base = new Date(); base.setHours(9, 0, 0, 0);
    const slots = Array.from({ length: 5 }, (_, i) => new Date(base.getTime() + (i + 1) * 86400000).toISOString());
    return { ok: true, stub: true, provider, data: { slots } };
  },
  async create_lead(args, { provider }) {
    return { ok: true, stub: true, provider, data: { lead_id: crypto.randomUUID(), crm_url: null } };
  },
  async update_lead(args, { provider }) {
    return { ok: true, stub: true, provider, data: { updated: true, lead_id: args.lead_id } };
  },
  async check_service_area(args, { provider }) {
    const address = String(args.address ?? "");
    return { ok: true, stub: true, provider, data: { in_area: address.length > 5, formatted_address: address, lat: 0, lng: 0 } };
  },
  async send_sms(args, { provider }) {
    return { ok: true, stub: true, provider, data: { message_sid: `SM${Date.now()}`, to: args.to } };
  },
  async send_email(args, { provider }) {
    return { ok: true, stub: true, provider, data: { message_id: crypto.randomUUID() } };
  },
  async lookup_property(args, { provider }) {
    return { ok: true, stub: true, provider, data: { sq_ft: 2400, num_squares: 24, pitch: "6:12", year_built: 2002, structure_type: "single_family" } };
  },
  async check_storm_data(args, { provider }) {
    return { ok: true, stub: true, provider, data: { hail_size_inches: 1.25, wind_mph: 62, event_date: "2025-07-12", in_storm_path: true } };
  },
  async live_transfer(args, { provider }) {
    return { ok: true, stub: true, provider, data: { transfer_status: "queued", transfer_to: args.transfer_to } };
  },
  async send_review_request(args, { provider }) {
    return { ok: true, stub: true, provider, data: { invite_link: `https://review.example.com/${crypto.randomUUID()}` } };
  },
  async generate_payment_link(args, { provider }) {
    return { ok: true, stub: true, provider, data: { payment_url: `https://pay.example.com/${crypto.randomUUID()}`, amount: args.amount } };
  },
  async draft_estimate_project(args, { provider }) {
    return { ok: true, stub: true, provider, data: { project_id: crypto.randomUUID(), draft_url: null } };
  },
  async store_recording(args, { provider }) {
    return { ok: true, stub: true, provider, data: { storage_url: `lovable://recordings/${args.call_sid ?? crypto.randomUUID()}.mp3` } };
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as ToolRequest;
    if (!body?.tool_name || !body?.deployment_id) {
      return json({ ok: false, error: "tool_name and deployment_id required" }, 400);
    }
    const handler = HANDLERS[body.tool_name];
    if (!handler) return json({ ok: false, error: `unknown tool ${body.tool_name}` }, 404);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: tool } = await sb
      .from("operator_tools")
      .select("provider, config, is_enabled")
      .eq("deployment_id", body.deployment_id)
      .eq("tool_name", body.tool_name)
      .maybeSingle();

    const provider = tool?.provider ?? "stub";
    const config = (tool?.config as Record<string, unknown>) ?? {};
    const result = await handler(body.arguments ?? {}, { provider, config });
    return json(result, result.ok ? 200 : 502);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: ToolResponse, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
