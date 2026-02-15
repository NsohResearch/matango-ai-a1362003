import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/**
 * Production edge function for influencer training via Lovable AI.
 * Uses real AI analysis to build a comprehensive style/persona profile
 * from uploaded training images. NO simulation.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI provider not configured. LOVABLE_API_KEY is missing." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, job_id } = body;

    if (action === "create") {
      const { influencer_id, input_media_object_ids, org_id, brand_id } = body;

      if (!influencer_id) {
        return new Response(JSON.stringify({ error: "influencer_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check credits
      const { data: credits } = await supabase.rpc("get_credits_remaining", { p_user_id: user.id });
      if (credits !== null && credits < 10) {
        return new Response(JSON.stringify({ error: "Insufficient credits for training" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch influencer data for context
      const { data: influencer } = await supabase.from("influencers")
        .select("*")
        .eq("id", influencer_id)
        .single();

      // Create the training job
      const { data: job, error: jobError } = await supabase.from("training_jobs").insert({
        user_id: user.id,
        influencer_id,
        org_id: org_id || null,
        brand_id: brand_id || null,
        input_media_object_ids: input_media_object_ids || [],
        status: "queued",
        progress: 0,
        credit_cost: 15,
      }).select().single();

      if (jobError) throw new Error(jobError.message);

      // Update influencer status
      await supabase.from("influencers").update({ status: "training" }).eq("id", influencer_id);

      // Track usage
      await supabase.from("usage_events").insert({
        user_id: user.id,
        event_type: "training_start",
        credits_used: 15,
        metadata: { job_id: job.id, influencer_id },
      });

      // ====== REAL LOVABLE AI ANALYSIS ======
      (async () => {
        try {
          await supabase.from("training_jobs").update({
            status: "processing",
            progress: 10,
            started_at: new Date().toISOString(),
          }).eq("id", job.id);

          // Step 1: Resolve training image URLs for AI analysis (progress: 10→25)
          const imageUrls: string[] = [];
          if (input_media_object_ids && input_media_object_ids.length > 0) {
            const { data: mediaObjects } = await supabase.from("media_objects")
              .select("bucket, object_key, mime_type, type")
              .in("id", input_media_object_ids);

            if (mediaObjects) {
              for (const mo of mediaObjects) {
                const { data: signedData } = await supabase.storage
                  .from(mo.bucket)
                  .createSignedUrl(mo.object_key, 3600);
                if (signedData?.signedUrl) {
                  imageUrls.push(signedData.signedUrl);
                }
              }
            }
          }

          await supabase.from("training_jobs").update({ progress: 25 }).eq("id", job.id);

          // Step 2: Use Lovable AI to analyze the images and build a persona profile (progress: 25→60)
          const analysisMessages: Array<{ role: string; content: unknown }> = [
            {
              role: "system",
              content: `You are an expert visual identity and brand persona analyst. Analyze the provided images of an influencer/character and create a comprehensive persona profile. You must respond with a tool call.`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze these ${imageUrls.length} training images for the influencer "${influencer?.name || "Unknown"}". 
Bio: ${influencer?.bio || "Not provided"}
Personality: ${influencer?.personality || "Not provided"}
Tags: ${influencer?.tags?.join(", ") || "None"}

Create a detailed persona profile covering:
1. Visual appearance (hair, skin tone, build, distinguishing features)
2. Style preferences (clothing patterns, accessories, color palette)
3. Emotional expression range
4. Ideal camera angles and framing
5. Environment/setting preferences
6. Brand-safe content guidelines
7. Recommended prompt modifiers for AI image generation
8. Behavioral constraints (what this character should/shouldn't do)`
                },
                // Include image URLs for multimodal analysis
                ...imageUrls.slice(0, 10).map(url => ({
                  type: "image_url" as const,
                  image_url: { url }
                }))
              ]
            }
          ];

          const aiPayload: Record<string, unknown> = {
            model: "google/gemini-2.5-flash",
            messages: analysisMessages,
            tools: [
              {
                type: "function",
                function: {
                  name: "create_persona_profile",
                  description: "Create a structured persona profile from image analysis",
                  parameters: {
                    type: "object",
                    properties: {
                      visual_description: { type: "string", description: "Detailed visual appearance description" },
                      style_guide: { type: "string", description: "Clothing, accessories, and aesthetic preferences" },
                      color_palette: { type: "array", items: { type: "string" }, description: "Key colors associated with this persona" },
                      camera_rules: { type: "string", description: "Recommended camera angles, framing, and lighting" },
                      expression_range: { type: "array", items: { type: "string" }, description: "Range of emotional expressions observed" },
                      environment_preferences: { type: "string", description: "Preferred settings and backgrounds" },
                      prompt_modifiers: { type: "array", items: { type: "string" }, description: "Keywords to include in AI generation prompts" },
                      behavioral_constraints: { type: "string", description: "What this persona should and shouldn't do" },
                      hook_patterns: { type: "array", items: { type: "string" }, description: "Suggested content hooks for this persona" },
                      cta_patterns: { type: "array", items: { type: "string" }, description: "Suggested call-to-action patterns" },
                      vocabulary: { type: "string", description: "Language style and vocabulary preferences" },
                    },
                    required: ["visual_description", "style_guide", "camera_rules", "behavioral_constraints", "prompt_modifiers"],
                    additionalProperties: false,
                  }
                }
              }
            ],
            tool_choice: { type: "function", function: { name: "create_persona_profile" } },
          };

          console.log("Calling Lovable AI for persona analysis...");

          const aiResponse = await fetch(LOVABLE_AI_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(aiPayload),
          });

          if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            console.error(`Lovable AI error (${aiResponse.status}):`, errText);
            if (aiResponse.status === 429) throw new Error("AI rate limit exceeded. Please try again later.");
            if (aiResponse.status === 402) throw new Error("AI credits exhausted. Please add credits.");
            throw new Error(`AI analysis failed: ${aiResponse.status}`);
          }

          const aiResult = await aiResponse.json();
          await supabase.from("training_jobs").update({ progress: 60 }).eq("id", job.id);

          // Step 3: Parse the AI analysis result (progress: 60→80)
          let personaProfile: Record<string, unknown> = {};
          try {
            const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              personaProfile = JSON.parse(toolCall.function.arguments);
            }
          } catch (parseErr) {
            console.warn("Failed to parse AI tool call, using raw content:", parseErr);
            personaProfile = {
              visual_description: aiResult.choices?.[0]?.message?.content || "Analysis completed",
              style_guide: "Generated from AI analysis",
              camera_rules: "Standard framing",
              behavioral_constraints: "Brand-safe content only",
              prompt_modifiers: [],
            };
          }

          await supabase.from("training_jobs").update({ progress: 80 }).eq("id", job.id);

          // Step 4: Create/update persona and model registry (progress: 80→100)
          // Update influencer persona
          await supabase.from("influencer_personas").upsert({
            influencer_id,
            persona_type: influencer?.persona_type || "custom",
            style_guide: personaProfile.style_guide as string || null,
            vocabulary: personaProfile.vocabulary as string || null,
            hook_patterns: personaProfile.hook_patterns as string[] || null,
            cta_patterns: personaProfile.cta_patterns as string[] || null,
          }, { onConflict: "influencer_id" });

          // Create model registry entry with the full analysis
          const { data: model } = await supabase.from("model_registry").insert({
            user_id: user.id,
            org_id: org_id || null,
            brand_id: brand_id || null,
            provider_model_id: `lovable-persona-${job.id.slice(0, 8)}`,
            name: `${influencer?.name || "influencer"}-persona-${Date.now()}`,
            type: "persona",
            provider: "lovable-ai",
            status: "active",
            metadata: {
              training_job_id: job.id,
              influencer_id,
              persona_profile: personaProfile,
              training_images_count: imageUrls.length,
              analyzed_at: new Date().toISOString(),
            },
          }).select().single();

          // Update influencer settings with AI-derived values
          await supabase.from("influencer_settings").upsert({
            influencer_id,
            camera_angle: personaProfile.camera_rules as string || null,
            default_style: personaProfile.style_guide as string || null,
          }, { onConflict: "influencer_id" });

          // Complete the training job
          await supabase.from("training_jobs").update({
            status: "completed",
            progress: 100,
            output_model_registry_id: model?.id || null,
            completed_at: new Date().toISOString(),
            logs: [
              { ts: new Date().toISOString(), msg: "Image analysis completed via Lovable AI" },
              { ts: new Date().toISOString(), msg: `Analyzed ${imageUrls.length} training images` },
              { ts: new Date().toISOString(), msg: "Persona profile created successfully" },
            ],
          }).eq("id", job.id);

          // Update influencer to "trained"
          await supabase.from("influencers").update({
            status: "trained",
            model_registry_id: model?.id || null,
            stats: {
              trained_at: new Date().toISOString(),
              model_id: model?.id,
              training_images: imageUrls.length,
              persona_summary: personaProfile.visual_description,
            },
          }).eq("id", influencer_id);

          console.log(`Training job ${job.id} completed — persona profile created via Lovable AI`);

        } catch (err) {
          console.error("Training job processing error:", err);
          await supabase.from("training_jobs").update({
            status: "failed",
            error_message: err instanceof Error ? err.message : "Unknown error",
            completed_at: new Date().toISOString(),
          }).eq("id", job.id);
          await supabase.from("influencers").update({ status: "draft" }).eq("id", influencer_id);
        }
      })();

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "status") {
      if (!job_id) {
        return new Response(JSON.stringify({ error: "job_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: job, error } = await supabase.from("training_jobs")
        .select("*")
        .eq("id", job_id)
        .eq("user_id", user.id)
        .single();

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "cancel") {
      if (!job_id) {
        return new Response(JSON.stringify({ error: "job_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: job, error } = await supabase.from("training_jobs")
        .update({ status: "cancelled" })
        .eq("id", job_id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (job?.influencer_id) {
        await supabase.from("influencers").update({ status: "draft" }).eq("id", job.influencer_id);
      }

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'create', 'status', or 'cancel'." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (err) {
    console.error("process-training-job error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
