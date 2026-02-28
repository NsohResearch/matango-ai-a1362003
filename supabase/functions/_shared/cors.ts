// Shared CORS and security headers for edge functions
const ALLOWED_ORIGINS = [
  "https://matango.ai",
  "https://www.matango.ai",
  "https://matango-ai.lovable.app",
  "https://id-preview--20a37c30-ab89-4bf5-95c9-8a92e8412fae.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-RateLimit-Limit": "60",
    "X-RateLimit-Remaining": "59",
    "Cache-Control": "no-store",
  };
}

export function handleCorsOptions(req: Request) {
  return new Response(null, { headers: getCorsHeaders(req) });
}
