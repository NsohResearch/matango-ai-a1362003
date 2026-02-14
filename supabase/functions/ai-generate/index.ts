import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Tool definitions for structured output ──

const brandEnrichTool = {
  type: "function" as const,
  function: {
    name: "extract_brand_info",
    description: "Extract structured brand information from a website URL or description.",
    parameters: {
      type: "object",
      properties: {
        brand_name: { type: "string" },
        product_name: { type: "string" },
        tagline: { type: "string" },
        category: { type: "string", enum: ["SaaS", "E-commerce", "Agency", "Fintech", "Health & Wellness", "Education", "Real Estate", "Media", "Consulting", "AI/ML", "B2B Services", "Consumer"] },
        brand_tone: { type: "string", enum: ["Professional", "Casual", "Bold", "Playful", "Authoritative", "Friendly", "Technical", "Inspirational"] },
        icp_personas: {
          type: "array",
          items: {
            type: "object",
            properties: { name: { type: "string" }, role: { type: "string" }, pain: { type: "string" } },
            required: ["name", "role", "pain"], additionalProperties: false,
          },
        },
        key_outcomes: { type: "array", items: { type: "string" } },
        differentiators: { type: "array", items: { type: "string" } },
        claims_proof: {
          type: "array",
          items: {
            type: "object",
            properties: { claim: { type: "string" }, proof: { type: "string" } },
            required: ["claim", "proof"], additionalProperties: false,
          },
        },
        voice_rules: { type: "array", items: { type: "string" } },
        forbidden_phrases: { type: "array", items: { type: "string" } },
      },
      required: ["brand_name", "category", "brand_tone", "icp_personas", "key_outcomes", "differentiators", "voice_rules"],
      additionalProperties: false,
    },
  },
};

const influencerAssistTool = {
  type: "function" as const,
  function: {
    name: "create_influencer_profile",
    description: "Generate a consistent AI influencer identity aligned with a Brand Brain.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Influencer display name" },
        bio: { type: "string", description: "2-3 sentence bio" },
        personality: { type: "string", description: "Personality description for content generation" },
        core_traits: { type: "array", items: { type: "string" }, description: "3-5 core personality traits" },
        visual_style: { type: "string", description: "Visual style description for image generation" },
        camera_guidelines: { type: "string", description: "Camera angle and framing defaults" },
        voice_profile: {
          type: "object",
          properties: {
            tone: { type: "string" },
            pacing: { type: "string" },
            emotion_range: { type: "string" },
          },
          required: ["tone", "pacing", "emotion_range"],
          additionalProperties: false,
        },
        content_strength: { type: "string", enum: ["authority", "education", "storytelling", "product-demo"] },
        consistency_guidelines: { type: "string", description: "Rules to maintain visual and personality coherence" },
      },
      required: ["name", "bio", "personality", "core_traits", "visual_style", "camera_guidelines", "voice_profile", "content_strength"],
      additionalProperties: false,
    },
  },
};

const scriptGenerateTool = {
  type: "function" as const,
  function: {
    name: "generate_video_script",
    description: "Generate a structured scene-ready video script.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        total_duration_seconds: { type: "number" },
        scenes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              scene_number: { type: "number" },
              duration_seconds: { type: "number" },
              dialogue: { type: "string" },
              visual_direction: { type: "string" },
              camera_direction: { type: "string" },
              text_overlay: { type: "string" },
            },
            required: ["scene_number", "duration_seconds", "dialogue", "visual_direction", "camera_direction"],
            additionalProperties: false,
          },
        },
        cta_line: { type: "string" },
        caption_suggestions: { type: "array", items: { type: "string" } },
        hashtag_suggestions: { type: "array", items: { type: "string" } },
        delivery_notes: { type: "string" },
        compliance_notes: { type: "array", items: { type: "string" } },
      },
      required: ["title", "total_duration_seconds", "scenes", "cta_line", "delivery_notes"],
      additionalProperties: false,
    },
  },
};

// ── Credit cost model ──

const CREDIT_COSTS: Record<string, number> = {
  "brand-enrich": 5,
  "influencer-assist": 3,
  "script-generate": 8,
  "campaign-generate": 6,
  "image-to-video": 40,
  "suggestion": 1,
  "default": 1,
};

function getCreditCost(type: string): number {
  return CREDIT_COSTS[type] || CREDIT_COSTS.default;
}

// ── System prompts ──

const systemPrompts: Record<string, string> = {
  "brand-enrich": "You are a brand strategist AI. Given a website URL, analyze what the brand does based on your knowledge. Extract comprehensive brand information including name, tagline, tone, category, ICP personas, key outcomes, differentiators, claims with proof, voice rules, and forbidden phrases. Be specific and actionable. If you don't know the website, infer reasonable brand data from the URL/domain name.",
  "influencer-assist": `You are Matango.ai Influencer Architect.
Your task is to generate a consistent AI influencer identity that:
1. Aligns with the selected Brand Brain.
2. Reflects the target ICP.
3. Maintains visual and personality coherence.
4. Is optimized for long-term multi-channel content creation.
Do NOT use hype language. Do NOT create exaggerated traits. Do NOT promise outcomes.`,
  "script-generate": `You are Matango.ai Campaign Script Engine.
You must:
- Use Brand Brain rules strictly.
- Respect forbidden phrases.
- Maintain tone consistency.
- Structure script into scenes.
- Optimize for chosen platform format.
- Keep length within requested duration.
No marketing hype. No unverifiable income claims.`,
  "campaign-generate": "You are a campaign strategist. Generate multi-channel campaign content including social media posts, email sequences, ad copy, and landing page headlines. Maintain brand voice consistency. Return structured JSON.",
  "suggestion": "You are an AI marketing assistant. Provide helpful, actionable suggestions based on the context. Be concise and specific.",
  "default": "You are an AI marketing assistant for Matango.ai. Help users with their marketing tasks. Be helpful, concise, and creative.",
};

// ── Tool mapping ──

function getToolConfig(type: string) {
  switch (type) {
    case "brand-enrich":
      return { tools: [brandEnrichTool], tool_choice: { type: "function", function: { name: "extract_brand_info" } } };
    case "influencer-assist":
      return { tools: [influencerAssistTool], tool_choice: { type: "function", function: { name: "create_influencer_profile" } } };
    case "script-generate":
      return { tools: [scriptGenerateTool], tool_choice: { type: "function", function: { name: "generate_video_script" } } };
    default:
      return null;
  }
}

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

    const creditCost = getCreditCost(type || "default");
    const aiModel = model || "google/gemini-3-flash-preview";
    const systemPrompt = systemPrompts[type || "default"] || systemPrompts.default;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const toolConfig = getToolConfig(type || "");
    const requestBody: Record<string, unknown> = {
      model: aiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    };

    if (toolConfig) {
      requestBody.tools = toolConfig.tools;
      requestBody.tool_choice = toolConfig.tool_choice;
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
    if (toolConfig) {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        content = toolCall.function.arguments;
      } else {
        content = data.choices?.[0]?.message?.content || "{}";
      }
    } else {
      content = data.choices?.[0]?.message?.content || "";
    }

    // Track usage with proper credit cost
    await supabase.from("usage_events").insert({
      user_id: user.id,
      event_type: "ai_generation",
      credits_used: creditCost,
      metadata: { type: type || "default", model: aiModel, prompt_length: prompt.length },
    });

    return new Response(JSON.stringify({ content, model: aiModel, credits_used: creditCost }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("AI generate error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
