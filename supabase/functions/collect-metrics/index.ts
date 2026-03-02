import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Cron-triggered: collects real engagement metrics from social platforms.
 * Runs every 15 minutes. Fetches metrics for posts published in last 30 days.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get published social posts with their connections
    const { data: posts, error } = await supabase
      .from("social_posts")
      .select("id, platform, platform_post_id, user_id, metrics")
      .eq("status", "published")
      .gte("published_at", thirtyDaysAgo)
      .not("platform_post_id", "is", null)
      .limit(100);

    if (error) throw error;
    if (!posts?.length) {
      return new Response(JSON.stringify({ message: "No posts to collect metrics for", collected: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by user+platform to batch token lookups
    const userPlatforms = new Map<string, { userId: string; platform: string }>();
    for (const post of posts) {
      userPlatforms.set(`${post.user_id}_${post.platform}`, { userId: post.user_id, platform: post.platform });
    }

    // Fetch tokens
    const tokenMap = new Map<string, string>();
    for (const [key, { userId, platform }] of userPlatforms) {
      const { data: conn } = await supabase.from("social_connections")
        .select("access_token, is_valid")
        .eq("user_id", userId)
        .eq("platform", platform)
        .eq("is_valid", true)
        .maybeSingle();
      if (conn?.access_token) tokenMap.set(key, conn.access_token);
    }

    let collected = 0;

    for (const post of posts) {
      const tokenKey = `${post.user_id}_${post.platform}`;
      const accessToken = tokenMap.get(tokenKey);
      if (!accessToken) continue;

      try {
        let metrics: Record<string, number> = {};

        if (post.platform === "instagram") {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${post.platform_post_id}/insights?metric=impressions,reach,likes,comments,shares,video_views&access_token=${accessToken}`
          );
          if (res.ok) {
            const data = await res.json();
            for (const m of data.data || []) {
              metrics[m.name] = m.values?.[0]?.value || 0;
            }
          }
        } else if (post.platform === "tiktok") {
          const res = await fetch("https://open.tiktokapis.com/v2/video/query/", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filters: { video_ids: [post.platform_post_id] },
              fields: ["view_count", "like_count", "comment_count", "share_count"],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const video = data.data?.videos?.[0];
            if (video) {
              metrics = {
                views: video.view_count || 0,
                likes: video.like_count || 0,
                comments: video.comment_count || 0,
                shares: video.share_count || 0,
              };
            }
          }
        } else if (post.platform === "youtube") {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${post.platform_post_id}`,
            { headers: { "Authorization": `Bearer ${accessToken}` } }
          );
          if (res.ok) {
            const data = await res.json();
            const stats = data.items?.[0]?.statistics;
            if (stats) {
              metrics = {
                views: parseInt(stats.viewCount) || 0,
                likes: parseInt(stats.likeCount) || 0,
                comments: parseInt(stats.commentCount) || 0,
              };
            }
          }
        }

        if (Object.keys(metrics).length > 0) {
          // Calculate engagement rate
          const impressions = metrics.impressions || metrics.views || 1;
          const engagementRate = ((metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)) / impressions * 100;
          metrics.engagement_rate = Math.round(engagementRate * 100) / 100;

          // Store as analytics_events
          const events = Object.entries(metrics).map(([name, value]) => ({
            user_id: post.user_id,
            event_type: `metric_${name}`,
            value,
            platform: post.platform,
            metadata: { social_post_id: post.id, platform_post_id: post.platform_post_id },
          }));

          await supabase.from("analytics_events").insert(events);

          // Update social_posts metrics
          await supabase.from("social_posts").update({
            metrics: { ...((post.metrics as any) || {}), ...metrics, last_collected: new Date().toISOString() },
          }).eq("id", post.id);

          collected++;
        }
      } catch (postErr) {
        console.error(`Error collecting metrics for post ${post.id}:`, postErr);
      }
    }

    return new Response(JSON.stringify({ collected, total: posts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("collect-metrics error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
