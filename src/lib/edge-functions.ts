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

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Edge function error: ${res.status}`);
  }

  return res.json();
}

export const aiGenerate = (prompt: string, type?: string) =>
  callEdgeFunction("ai-generate", { prompt, type });

export const kahChat = (message: string, session_id?: string) =>
  callEdgeFunction("kah-chat", { message, session_id });
