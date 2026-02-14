import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, session_id } = await req.json();
    if (!message) return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: corsHeaders });

    // Check QA corpus first
    const { data: qaMatches } = await supabase
      .from("kah_qa_corpus")
      .select("answer, question_pattern")
      .limit(50);

    const lowerMessage = message.toLowerCase();
    const match = qaMatches?.find((qa: any) =>
      lowerMessage.includes(qa.question_pattern.toLowerCase())
    );

    let reply: string;
    if (match) {
      reply = match.answer;
    } else {
      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are K'ah, the AI guide for Matango.ai — an AI-powered marketing platform for solopreneurs and agencies. K'ah stands for "Knowledge-Amplified Human" and you embody the spirit of the AAO (AI-Amplified Operator) philosophy. You help users understand the platform, AI marketing concepts, and guide them through their journey. Be warm, knowledgeable, and encouraging. Keep responses concise (2-3 paragraphs max). Always refer to yourself as K'ah.`,
            },
            { role: "user", content: message },
          ],
          temperature: 0.8,
          max_tokens: 1024,
        }),
      });
      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || "I'm having trouble thinking right now. Please try again!";
    }

    // Store messages
    const sid = session_id || crypto.randomUUID();
    await supabase.from("kah_messages").insert([
      { content: message, role: "user", session_id: sid },
      { content: reply, role: "assistant", session_id: sid },
    ]);

    return new Response(JSON.stringify({ reply, session_id: sid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
