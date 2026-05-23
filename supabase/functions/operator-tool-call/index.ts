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

interface ToolResponse { ok: boolean; data?: unknown; error?: string; provider?: string; stub?: boolean }

type Ctx = { provider: string; config: Record<string, unknown>; deployment: any };
type Handler = (args: Record<string, unknown>, ctx: Ctx) => Promise<ToolResponse>;

// ---------- Calendar adapters ----------

async function googleCalendarCheck(args: Record<string, unknown>): Promise<ToolResponse> {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const conn = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovable || !conn) return { ok: true, stub: true, provider: "google_calendar", data: stubSlots() };

  const calendarId = (args.calendar_id as string) ?? "primary";
  const timeMin = (args.from as string) ?? new Date().toISOString();
  const timeMax = (args.to as string) ?? new Date(Date.now() + 7 * 86400000).toISOString();
  const url = `https://connector-gateway.lovable.dev/google_calendar/calendar/v3/freeBusy`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovable}`,
      "X-Connection-Api-Key": conn,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarId }] }),
  });
  if (!res.ok) return { ok: false, provider: "google_calendar", error: `freeBusy ${res.status}: ${await res.text()}` };
  const j = await res.json();
  const busy: { start: string; end: string }[] = j.calendars?.[calendarId]?.busy ?? [];
  const slots = generateOpenSlots(timeMin, timeMax, busy);
  return { ok: true, provider: "google_calendar", data: { slots, busy } };
}

async function googleCalendarBook(args: Record<string, unknown>): Promise<ToolResponse> {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const conn = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovable || !conn) return { ok: true, stub: true, provider: "google_calendar", data: { confirmation_id: `INS-${Date.now()}`, datetime: args.datetime } };

  const calendarId = (args.calendar_id as string) ?? "primary";
  const start = String(args.datetime);
  const duration = Number(args.duration_minutes ?? 60);
  const end = new Date(new Date(start).getTime() + duration * 60000).toISOString();
  const url = `https://connector-gateway.lovable.dev/google_calendar/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovable}`,
      "X-Connection-Api-Key": conn,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: `Roof inspection — ${args.customer_name ?? "Caller"}`,
      description: `Address: ${args.address}\nPhone: ${args.phone}\nNotes: ${args.notes ?? ""}\nTrigger: ${args.trigger ?? "n/a"}`,
      location: String(args.address ?? ""),
      start: { dateTime: start },
      end: { dateTime: end },
    }),
  });
  if (!res.ok) return { ok: false, provider: "google_calendar", error: `events.insert ${res.status}: ${await res.text()}` };
  const j = await res.json();
  return { ok: true, provider: "google_calendar", data: { confirmation_id: j.id, datetime: start, calendar_link: j.htmlLink } };
}

async function acuityCheck(args: Record<string, unknown>, { config }: Ctx): Promise<ToolResponse> {
  const user = Deno.env.get("ACUITY_USER_ID");
  const key = Deno.env.get("ACUITY_API_KEY");
  if (!user || !key) return { ok: true, stub: true, provider: "acuity", data: stubSlots() };

  const apptTypeId = (config.acuity_appointment_type_id as string) ?? (args.appointment_type_id as string);
  if (!apptTypeId) return { ok: false, provider: "acuity", error: "acuity_appointment_type_id missing in tool config" };
  const date = ((args.date as string) ?? new Date().toISOString()).slice(0, 10);
  const auth = "Basic " + btoa(`${user}:${key}`);
  const res = await fetch(`https://acuityscheduling.com/api/v1/availability/times?appointmentTypeID=${apptTypeId}&date=${date}`, {
    headers: { "Authorization": auth },
  });
  if (!res.ok) return { ok: false, provider: "acuity", error: `acuity ${res.status}: ${await res.text()}` };
  const slots = await res.json();
  return { ok: true, provider: "acuity", data: { slots } };
}

async function acuityBook(args: Record<string, unknown>, { config }: Ctx): Promise<ToolResponse> {
  const user = Deno.env.get("ACUITY_USER_ID");
  const key = Deno.env.get("ACUITY_API_KEY");
  if (!user || !key) return { ok: true, stub: true, provider: "acuity", data: { confirmation_id: `INS-${Date.now()}`, datetime: args.datetime } };

  const apptTypeId = (config.acuity_appointment_type_id as string) ?? (args.appointment_type_id as string);
  const auth = "Basic " + btoa(`${user}:${key}`);
  const [firstName, ...rest] = String(args.customer_name ?? "Caller").split(" ");
  const res = await fetch(`https://acuityscheduling.com/api/v1/appointments?admin=true`, {
    method: "POST",
    headers: { "Authorization": auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      appointmentTypeID: apptTypeId,
      datetime: args.datetime,
      firstName,
      lastName: rest.join(" ") || "Caller",
      phone: args.phone ?? "",
      email: args.email ?? "",
      notes: `Address: ${args.address}\nTrigger: ${args.trigger}\n${args.notes ?? ""}`,
    }),
  });
  if (!res.ok) return { ok: false, provider: "acuity", error: `acuity ${res.status}: ${await res.text()}` };
  const j = await res.json();
  return { ok: true, provider: "acuity", data: { confirmation_id: j.id, datetime: j.datetime, calendar_link: j.confirmationPage } };
}

// ---------- Geo ----------

async function googleMapsServiceArea(args: Record<string, unknown>, { deployment }: Ctx): Promise<ToolResponse> {
  const key = Deno.env.get("GOOGLE_MAPS_API_KEY");
  const address = String(args.address ?? "");
  if (!key || !address) {
    return { ok: true, stub: true, provider: "google_maps", data: { in_area: address.length > 5, formatted_address: address, lat: 0, lng: 0 } };
  }
  const geo = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`).then(r => r.json());
  const result = geo.results?.[0];
  if (!result) return { ok: true, provider: "google_maps", data: { in_area: false, formatted_address: address, error: "no_geocode" } };
  const loc = result.geometry.location;
  const formatted = result.formatted_address;

  let inArea = true;
  const zips: string[] = deployment.service_area_zips ?? [];
  if (zips.length) {
    const zip = result.address_components?.find((c: any) => c.types?.includes("postal_code"))?.short_name;
    inArea = !!zip && zips.includes(zip);
  } else if (deployment.service_area_center && deployment.service_area_radius_miles) {
    const center = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(deployment.service_area_center)}&key=${key}`).then(r => r.json());
    const c = center.results?.[0]?.geometry?.location;
    if (c) inArea = haversineMiles(loc.lat, loc.lng, c.lat, c.lng) <= deployment.service_area_radius_miles;
  }
  return { ok: true, provider: "google_maps", data: { in_area: inArea, formatted_address: formatted, lat: loc.lat, lng: loc.lng } };
}

// ---------- Handlers ----------

const HANDLERS: Record<string, Handler> = {
  async book_inspection(args, ctx) {
    if (ctx.provider === "google_calendar") return googleCalendarBook(args);
    if (ctx.provider === "acuity") return acuityBook(args, ctx);
    return { ok: true, stub: true, provider: ctx.provider, data: { confirmation_id: `INS-${Date.now()}`, datetime: args.datetime } };
  },
  async check_availability(args, ctx) {
    if (ctx.provider === "google_calendar") return googleCalendarCheck(args);
    if (ctx.provider === "acuity") return acuityCheck(args, ctx);
    return { ok: true, stub: true, provider: ctx.provider, data: stubSlots() };
  },
  async check_service_area(args, ctx) {
    return googleMapsServiceArea(args, ctx);
  },
  async create_lead(args, { provider }) {
    return { ok: true, stub: true, provider, data: { lead_id: crypto.randomUUID(), crm_url: null } };
  },
  async update_lead(args, { provider }) {
    return { ok: true, stub: true, provider, data: { updated: true, lead_id: args.lead_id } };
  },
  async send_sms(args, { provider }) {
    return { ok: true, stub: true, provider, data: { message_sid: `SM${Date.now()}`, to: args.to } };
  },
  async send_email(args, { provider }) {
    return { ok: true, stub: true, provider, data: { message_id: crypto.randomUUID() } };
  },
  async lookup_property(args, { provider }) {
    return { ok: true, stub: true, provider, data: { sq_ft: 2400, num_squares: 24, pitch: "6:12", year_built: 2002 } };
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
    return { ok: true, stub: true, provider, data: { project_id: crypto.randomUUID() } };
  },
  async store_recording(args, { provider }) {
    return { ok: true, stub: true, provider, data: { storage_url: `lovable://recordings/${args.call_sid ?? crypto.randomUUID()}.mp3` } };
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as ToolRequest;
    if (!body?.tool_name || !body?.deployment_id) return json({ ok: false, error: "tool_name and deployment_id required" }, 400);

    const handler = HANDLERS[body.tool_name];
    if (!handler) return json({ ok: false, error: `unknown tool ${body.tool_name}` }, 404);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const [{ data: tool }, { data: deployment }] = await Promise.all([
      sb.from("operator_tools").select("provider, config, is_enabled").eq("deployment_id", body.deployment_id).eq("tool_name", body.tool_name).maybeSingle(),
      sb.from("operator_deployments").select("*").eq("id", body.deployment_id).maybeSingle(),
    ]);

    const provider = tool?.provider ?? "stub";
    const config = (tool?.config as Record<string, unknown>) ?? {};
    const result = await handler(body.arguments ?? {}, { provider, config, deployment });
    return json(result, result.ok ? 200 : 502);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: ToolResponse, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function stubSlots() {
  const base = new Date(); base.setHours(9, 0, 0, 0);
  const slots = Array.from({ length: 5 }, (_, i) => new Date(base.getTime() + (i + 1) * 86400000).toISOString());
  return { slots };
}

function generateOpenSlots(from: string, to: string, busy: { start: string; end: string }[]) {
  const out: string[] = [];
  const start = new Date(from);
  const end = new Date(to);
  const cursor = new Date(start);
  cursor.setMinutes(0, 0, 0);
  while (cursor < end && out.length < 12) {
    const h = cursor.getHours();
    const slotEnd = new Date(cursor.getTime() + 60 * 60000);
    if (h >= 8 && h < 17 && cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      const conflict = busy.some(b => new Date(b.start) < slotEnd && new Date(b.end) > cursor);
      if (!conflict) out.push(cursor.toISOString());
    }
    cursor.setHours(cursor.getHours() + 1);
  }
  return out;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
