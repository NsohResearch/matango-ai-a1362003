import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function callEdgeFunction(functionName: string, body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (res.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Edge function error: ${res.status}`);
  }

  return res.json();
}

export const aiGenerate = (prompt: string, type?: string, model?: string) =>
  callEdgeFunction("ai-generate", { prompt, type, model });

export const kahChat = (message: string, session_id?: string) =>
  callEdgeFunction("kah-chat", { message, session_id });

export const aaoExecute = (aao_type: string, context: string, options?: { campaign_id?: string; brand_id?: string; action?: string }) =>
  callEdgeFunction("aao-execute", { aao_type, context, ...options });

export const gdprProcess = (action: string, request_id?: string) =>
  callEdgeFunction("gdpr-process", { action, request_id });

export const analyticsSeed = (action: string) =>
  callEdgeFunction("analytics-seed", { action });

export const accountLifecycle = (action: string, params?: Record<string, unknown>) =>
  callEdgeFunction("account-lifecycle", { action, ...params });

export const processVideoJob = (action: string, params?: Record<string, unknown>) =>
  callEdgeFunction("process-video-job", { action, ...params });

export const processTrainingJob = (action: string, params?: Record<string, unknown>) =>
  callEdgeFunction("process-training-job", { action, ...params });

export const publishPosts = (action: string, params?: Record<string, unknown>) =>
  callEdgeFunction("publish-posts", { action, ...params });
