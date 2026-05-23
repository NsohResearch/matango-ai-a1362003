// Receives Retell custom-function calls and call events, dispatches to
// operator-tool-call, and stores transcripts/recordings via operator_call_logs.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const payload = await req.json();
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Retell sends two shapes: function calls (name + args + call.agent_id) and call events (event + call).
    if (payload?.name && payload?.args) {
      const agentId = payload.call?.agent_id;
      const { data: deployment } = await sb.from("operator_deployments")
        .select("id").eq("config->>retell_agent_id", agentId).maybeSingle();
      if (!deployment) return json({ error: "deployment not found for agent" }, 404);

      const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/operator-tool-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
        body: JSON.stringify({
          deployment_id: deployment.id, tool_name: payload.name,
          arguments: payload.args, call_sid: payload.call?.call_id,
        }),
      });
      const data = await res.json();
      return json(data);
    }

    if (payload?.event && payload?.call) {
      const agentId = payload.call.agent_id;
      const { data: deployment } = await sb.from("operator_deployments")
        .select("id, user_id").eq("config->>retell_agent_id", agentId).maybeSingle();
      if (deployment && (payload.event === "call_ended" || payload.event === "call_analyzed")) {
        await sb.from("operator_call_logs").insert({
          deployment_id: deployment.id,
          user_id: deployment.user_id,
          call_sid: payload.call.call_id,
          from_number: payload.call.from_number ?? null,
          to_number: payload.call.to_number ?? null,
          direction: payload.call.direction ?? "inbound",
          duration_seconds: payload.call.duration_ms ? Math.round(payload.call.duration_ms / 1000) : null,
          transcript: payload.call.transcript ?? null,
          recording_url: payload.call.recording_url ?? null,
          qualification_score: payload.call.call_analysis?.custom_analysis_data?.bant_score ?? null,
          outcome: payload.call.call_analysis?.call_summary ?? null,
          metadata: payload.call.call_analysis ?? {},
        });
      }
      return json({ ok: true });
    }

    return json({ ok: true, ignored: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
