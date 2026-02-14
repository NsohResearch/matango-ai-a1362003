import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
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

    const { prompt, type, model } = await req.json();
    if (!prompt) return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: corsHeaders });

    const aiModel = model || "google/gemini-2.5-flash";
    const systemPrompts: Record<string, string> = {
      "brand-enrich": "You are a brand strategist AI. Given a website URL or brand description, extract and structure: brand name, tagline, tone, category, ICP personas, key outcomes, differentiators, claims with proof, and voice rules. Return valid JSON.",
      "campaign-generate": "You are a campaign strategist. Generate multi-channel campaign content including social media posts, email sequences, ad copy, and landing page headlines. Maintain brand voice consistency. Return structured JSON.",
      "script-generate": "You are a video script writer. Create engaging video scripts with scene breakdowns, dialogue, camera directions, and timing. Return structured JSON with scenes array.",
      "suggestion": "You are an AI marketing assistant. Provide helpful, actionable suggestions based on the context. Be concise and specific.",
      "default": "You are an AI marketing assistant for Matango.ai. Help users with their marketing tasks. Be helpful, concise, and creative.",
    };

    const systemPrompt = systemPrompts[type || "default"] || systemPrompts.default;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: corsHeaders });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: corsHeaders });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Track usage
    await supabase.from("usage_events").insert({
      user_id: user.id,
      event_type: "ai_generation",
      credits_used: 1,
      metadata: { type: type || "default", model: aiModel, prompt_length: prompt.length },
    });

    return new Response(JSON.stringify({ content, model: aiModel }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("AI generate error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
