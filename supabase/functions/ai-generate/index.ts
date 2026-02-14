import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const brandEnrichTool = {
  type: "function" as const,
  function: {
    name: "extract_brand_info",
    description: "Extract structured brand information from a website URL or description.",
    parameters: {
      type: "object",
      properties: {
        brand_name: { type: "string", description: "The brand/company name" },
        product_name: { type: "string", description: "Main product or service name" },
        tagline: { type: "string", description: "Brand tagline or slogan" },
        category: { type: "string", enum: ["SaaS", "E-commerce", "Agency", "Fintech", "Health & Wellness", "Education", "Real Estate", "Media", "Consulting", "AI/ML", "B2B Services", "Consumer"], description: "Business category" },
        brand_tone: { type: "string", enum: ["Professional", "Casual", "Bold", "Playful", "Authoritative", "Friendly", "Technical", "Inspirational"], description: "Primary brand voice tone" },
        icp_personas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Persona name e.g. 'Marketing Manager Maya'" },
              role: { type: "string", description: "Job title or role" },
              pain: { type: "string", description: "Primary pain point this persona has" },
            },
            required: ["name", "role", "pain"],
            additionalProperties: false,
          },
          description: "2-4 ideal customer personas",
        },
        key_outcomes: {
          type: "array",
          items: { type: "string" },
          description: "3-5 key outcomes or benefits the product delivers",
        },
        differentiators: {
          type: "array",
          items: { type: "string" },
          description: "3-5 things that make this brand unique vs competitors",
        },
        claims_proof: {
          type: "array",
          items: {
            type: "object",
            properties: {
              claim: { type: "string", description: "A marketing claim the brand makes" },
              proof: { type: "string", description: "Evidence or source backing the claim" },
            },
            required: ["claim", "proof"],
            additionalProperties: false,
          },
          description: "2-4 claims with supporting proof",
        },
        voice_rules: {
          type: "array",
          items: { type: "string" },
          description: "3-5 voice/writing style rules e.g. 'Always use active voice'",
        },
        forbidden_phrases: {
          type: "array",
          items: { type: "string" },
          description: "2-4 words or phrases the brand should never use",
        },
      },
      required: ["brand_name", "category", "brand_tone", "icp_personas", "key_outcomes", "differentiators", "voice_rules"],
      additionalProperties: false,
    },
  },
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

    const aiModel = model || "google/gemini-3-flash-preview";
    const systemPrompts: Record<string, string> = {
      "brand-enrich": "You are a brand strategist AI. Given a website URL, analyze what the brand does based on your knowledge. Extract comprehensive brand information including name, tagline, tone, category, ICP personas, key outcomes, differentiators, claims with proof, voice rules, and forbidden phrases. Be specific and actionable. If you don't know the website, infer reasonable brand data from the URL/domain name.",
      "campaign-generate": "You are a campaign strategist. Generate multi-channel campaign content including social media posts, email sequences, ad copy, and landing page headlines. Maintain brand voice consistency. Return structured JSON.",
      "script-generate": "You are a video script writer. Create engaging video scripts with scene breakdowns, dialogue, camera directions, and timing. Return structured JSON with scenes array.",
      "suggestion": "You are an AI marketing assistant. Provide helpful, actionable suggestions based on the context. Be concise and specific.",
      "default": "You are an AI marketing assistant for Matango.ai. Help users with their marketing tasks. Be helpful, concise, and creative.",
    };

    const systemPrompt = systemPrompts[type || "default"] || systemPrompts.default;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    // Use tool calling for brand-enrich to get reliable structured output
    const isBrandEnrich = type === "brand-enrich";
    const requestBody: Record<string, unknown> = {
      model: aiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    };

    if (isBrandEnrich) {
      requestBody.tools = [brandEnrichTool];
      requestBody.tool_choice = { type: "function", function: { name: "extract_brand_info" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: corsHeaders });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: corsHeaders });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    
    let content: string;
    if (isBrandEnrich) {
      // Extract from tool call response
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        content = toolCall.function.arguments;
      } else {
        // Fallback to regular content
        content = data.choices?.[0]?.message?.content || "{}";
      }
    } else {
      content = data.choices?.[0]?.message?.content || "";
    }

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
