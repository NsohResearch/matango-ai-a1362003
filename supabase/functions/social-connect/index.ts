import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Social platform OAuth connection manager.
 * Actions: initiate, callback, disconnect, list
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
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;
    const baseUrl = Deno.env.get("MATANGO_BASE_URL") || "https://matango-ai.lovable.app";

    if (action === "initiate") {
      const { platform } = body;
      const state = crypto.randomUUID();

      // Store state for CSRF verification
      await supabase.from("social_connections").upsert({
        user_id: user.id,
        platform,
        status: "pending",
        connection_metadata: { oauth_state: state },
      }, { onConflict: "user_id,platform" });

      let authorizationUrl: string;
      const redirectUri = `${baseUrl}/api/social-callback`;

      if (platform === "instagram") {
        const appId = Deno.env.get("FACEBOOK_APP_ID");
        if (!appId) throw new Error("Instagram not configured. FACEBOOK_APP_ID missing.");
        authorizationUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement&state=${state}&response_type=code`;
      } else if (platform === "tiktok") {
        const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
        if (!clientKey) throw new Error("TikTok not configured. TIKTOK_CLIENT_KEY missing.");
        authorizationUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user.info.basic,video.publish&response_type=code&state=${state}`;
      } else if (platform === "youtube") {
        const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
        if (!clientId) throw new Error("YouTube not configured. GOOGLE_OAUTH_CLIENT_ID missing.");
        authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly&response_type=code&state=${state}&access_type=offline&prompt=consent`;
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      return new Response(JSON.stringify({ authorization_url: authorizationUrl, state }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "callback") {
      const { platform, code, state } = body;
      const redirectUri = `${baseUrl}/api/social-callback`;

      // Verify CSRF state
      const { data: conn } = await supabase.from("social_connections")
        .select("id, connection_metadata")
        .eq("user_id", user.id)
        .eq("platform", platform)
        .single();

      if (!conn || (conn.connection_metadata as any)?.oauth_state !== state) {
        return new Response(JSON.stringify({ error: "Invalid state parameter. Possible CSRF attack." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let accessToken: string, refreshToken: string | null = null, expiresIn: number | null = null;
      let platformUserId: string | null = null, platformUsername: string | null = null;

      if (platform === "instagram") {
        // Exchange code for short-lived token
        const tokenRes = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: Deno.env.get("FACEBOOK_APP_ID")!,
            client_secret: Deno.env.get("FACEBOOK_APP_SECRET")!,
            code,
            redirect_uri: redirectUri,
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new Error(tokenData.error.message);

        // Exchange for long-lived token
        const llRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${Deno.env.get("FACEBOOK_APP_ID")}&client_secret=${Deno.env.get("FACEBOOK_APP_SECRET")}&fb_exchange_token=${tokenData.access_token}`);
        const llData = await llRes.json();
        accessToken = llData.access_token || tokenData.access_token;
        expiresIn = llData.expires_in || 5184000;

        // Get Instagram Business Account
        const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
        const pagesData = await pagesRes.json();
        const page = pagesData.data?.[0];
        if (page) {
          const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`);
          const igData = await igRes.json();
          platformUserId = igData.instagram_business_account?.id;
          const igProfile = platformUserId
            ? await fetch(`https://graph.facebook.com/v19.0/${platformUserId}?fields=username&access_token=${accessToken}`).then(r => r.json())
            : null;
          platformUsername = igProfile?.username;
        }

      } else if (platform === "tiktok") {
        const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_key: Deno.env.get("TIKTOK_CLIENT_KEY")!,
            client_secret: Deno.env.get("TIKTOK_CLIENT_SECRET")!,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.data?.error_code) throw new Error(tokenData.data.description);
        accessToken = tokenData.data.access_token;
        refreshToken = tokenData.data.refresh_token;
        expiresIn = tokenData.data.expires_in;
        platformUserId = tokenData.data.open_id;

      } else if (platform === "youtube") {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")!,
            client_secret: Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")!,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new Error(tokenData.error_description);
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token;
        expiresIn = tokenData.expires_in;

        // Get channel info
        const channelRes = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const channelData = await channelRes.json();
        platformUserId = channelData.items?.[0]?.id;
        platformUsername = channelData.items?.[0]?.snippet?.title;
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Save connection
      await supabase.from("social_connections").update({
        access_token: accessToken!,
        refresh_token: refreshToken,
        token_expires_at: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
        platform_user_id: platformUserId,
        platform_username: platformUsername,
        status: "connected",
        is_valid: true,
        last_verified_at: new Date().toISOString(),
        connection_metadata: { oauth_state: null },
      }).eq("id", conn.id);

      return new Response(JSON.stringify({ success: true, platform, username: platformUsername }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "disconnect") {
      const { platform } = body;
      await supabase.from("social_connections").update({
        access_token: null,
        refresh_token: null,
        is_valid: false,
        status: "disconnected",
      }).eq("user_id", user.id).eq("platform", platform);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "list") {
      const { data, error } = await supabase.from("social_connections")
        .select("id, platform, status, platform_username, is_valid, last_verified_at")
        .eq("user_id", user.id);
      if (error) throw error;

      return new Response(JSON.stringify({ connections: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (err) {
    console.error("social-connect error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
