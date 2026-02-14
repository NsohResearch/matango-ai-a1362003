import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AAO_TYPES: Record<string, { systemPrompt: string; description: string }> = {
  "content": {
    systemPrompt: "You are a Content AAO — an AI-Amplified Operator specialized in generating marketing content. Given brand context and campaign parameters, generate high-quality social media posts, blog outlines, ad copy, and email content. Always maintain brand voice. Return structured JSON.",
    description: "Generate marketing content across channels",
  },
  "campaign": {
    systemPrompt: "You are a Campaign AAO — an AI-Amplified Operator specialized in orchestrating multi-channel campaigns. Analyze brand DNA, target ICP, and campaign angle to generate a complete campaign plan with assets for each platform. Return structured JSON with platform-specific content.",
    description: "Orchestrate multi-channel campaigns",
  },
  "analytics": {
    systemPrompt: "You are an Analytics AAO — an AI-Amplified Operator specialized in data analysis and insights. Analyze engagement metrics, identify trends, suggest optimizations. Return structured JSON with insights array.",
    description: "Process data and generate insights",
  },
  "scheduling": {
    systemPrompt: "You are a Scheduling AAO — an AI-Amplified Operator specialized in optimal content scheduling. Given content assets and platform data, determine the best posting times for maximum engagement. Return structured JSON with schedule recommendations.",
    description: "Optimize content calendar",
  },
  "video": {
    systemPrompt: "You are a Video AAO — an AI-Amplified Operator specialized in video content strategy. Generate video concepts, scripts, scene breakdowns, and thumbnail ideas. Return structured JSON.",
    description: "Create video content strategies",
  },
  "lead": {
    systemPrompt: "You are a Lead AAO — an AI-Amplified Operator specialized in lead generation and nurturing. Analyze campaign performance and suggest lead capture strategies, email sequences, and follow-up actions. Return structured JSON.",
    description: "Capture and nurture leads",
  },
  "engagement": {
    systemPrompt: "You are an Engagement AAO — an AI-Amplified Operator specialized in audience interaction. Draft responses to comments, create engagement-driving content, and suggest community building strategies. Return structured JSON.",
    description: "Manage audience interactions",
  },
  "visual": {
    systemPrompt: "You are a Visual AAO — an AI-Amplified Operator specialized in visual brand assets. Generate image prompts, design briefs, and visual content strategies that maintain brand consistency. Return structured JSON.",
    description: "Generate visual brand assets",
  },
};

serve(async (req) => {
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

    const { aao_type, action, context, campaign_id, brand_id } = await req.json();
    
    if (!aao_type || !AAO_TYPES[aao_type]) {
      return new Response(JSON.stringify({ error: "Invalid AAO type", available_types: Object.keys(AAO_TYPES) }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Log AAO task start
    const { data: task } = await supabase.from("aao_activity_log").insert({
      user_id: user.id,
      aao_type,
      action: action || "execute",
      description: `${AAO_TYPES[aao_type].description}: ${context?.substring(0, 100) || ""}`,
      metadata: { campaign_id, brand_id, context_preview: context?.substring(0, 200) },
      status: "running",
    }).select().single();

    // Fetch brand context if provided
    let brandContext = "";
    if (brand_id) {
      const { data: brand } = await supabase.from("business_dna").select("*").eq("id", brand_id).single();
      if (brand) {
        brandContext = `\n\nBrand Context:
- Brand: ${brand.brand_name}
- Tagline: ${brand.tagline}
- Tone: ${brand.brand_tone}
- Category: ${brand.category}
- Key Outcomes: ${JSON.stringify(brand.key_outcomes)}
- Differentiators: ${JSON.stringify(brand.differentiators)}
- Voice Rules: ${JSON.stringify(brand.voice_rules)}`;
      }
    }

    // Fetch campaign context if provided
    let campaignContext = "";
    if (campaign_id) {
      const { data: campaign } = await supabase.from("unified_campaigns").select("*").eq("id", campaign_id).single();
      if (campaign) {
        campaignContext = `\n\nCampaign Context:
- Campaign: ${campaign.name}
- Angle: ${campaign.angle}
- Target ICP: ${campaign.target_icp}
- Status: ${campaign.status}`;
      }
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: AAO_TYPES[aao_type].systemPrompt },
          { role: "user", content: `${context || "Execute default task"}${brandContext}${campaignContext}` },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        await supabase.from("aao_activity_log").update({ status: "failed", completed_at: new Date().toISOString() }).eq("id", task?.id);
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        await supabase.from("aao_activity_log").update({ status: "failed", completed_at: new Date().toISOString() }).eq("id", task?.id);
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Store campaign assets if this is a campaign AAO
    if (aao_type === "campaign" && campaign_id) {
      try {
        const parsed = JSON.parse(content.replace(/```json\n?|```/g, ""));
        const assets = parsed.assets || parsed.content || [];
        if (Array.isArray(assets)) {
          for (const asset of assets) {
            await supabase.from("campaign_assets").insert({
              campaign_id,
              asset_type: asset.type || "social_post",
              platform: asset.platform || "general",
              content: typeof asset.content === "string" ? asset.content : JSON.stringify(asset),
              status: "draft",
            });
          }
        }
      } catch { /* Content wasn't parseable JSON, store as-is */ }
    }

    // Mark task complete
    if (task?.id) {
      await supabase.from("aao_activity_log").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: { ...((task as any).metadata || {}), result_preview: content.substring(0, 500) },
      }).eq("id", task.id);
    }

    return new Response(JSON.stringify({ 
      content, 
      aao_type,
      task_id: task?.id,
      model: "google/gemini-3-flash-preview" 
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (err) {
    console.error("AAO execute error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
