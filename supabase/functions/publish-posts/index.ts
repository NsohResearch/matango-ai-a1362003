import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Production edge function for publishing scheduled posts to social platforms.
 * Actions:
 *   - "process": Find due scheduled_posts and attempt publishing via platform APIs
 *   - "retry": Retry a specific failed social_post
 *   - "status": Get publishing status for a scheduled_post
 * 
 * Platform publishing requires valid OAuth tokens in social_connections.
 * Gracefully fails with clear error messages when tokens are missing/expired.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action } = body;

    if (action === "process") {
      // Find all scheduled posts that are due (scheduled_for <= now, status = 'scheduled')
      const now = new Date().toISOString();
      const { data: duePosts, error: fetchError } = await supabase
        .from("scheduled_posts")
        .select(`
          *,
          influencers:influencer_id (name, avatar_url)
        `)
        .eq("status", "scheduled")
        .lte("scheduled_for", now)
        .order("scheduled_for", { ascending: true })
        .limit(50);

      if (fetchError) throw new Error(fetchError.message);
      if (!duePosts || duePosts.length === 0) {
        return new Response(JSON.stringify({ processed: 0, message: "No posts due for publishing" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results: Array<{ post_id: string; platform: string; status: string; error?: string }> = [];

      for (const post of duePosts) {
        // Get all target platforms
        const platforms = post.platforms || [post.platform];

        for (const platform of platforms) {
          try {
            // Find the social connection for this platform + user
            const { data: connection } = await supabase
              .from("social_connections")
              .select("*")
              .eq("user_id", post.user_id)
              .eq("platform", platform)
              .single();

            if (!connection) {
              // No connection — create a failed social_post record
              await supabase.from("social_posts").insert({
                user_id: post.user_id,
                scheduled_post_id: post.id,
                connection_id: null,
                content: post.content,
                image_url: post.image_url,
                status: "failed",
                error_message: `No ${platform} account connected. Please connect your ${platform} account in Social Connections.`,
              });
              results.push({ post_id: post.id, platform, status: "failed", error: "No account connected" });
              continue;
            }

            // Check token expiry
            if (connection.expires_at && new Date(connection.expires_at) < new Date()) {
              await supabase.from("social_posts").insert({
                user_id: post.user_id,
                scheduled_post_id: post.id,
                connection_id: connection.id,
                content: post.content,
                image_url: post.image_url,
                status: "failed",
                error_message: `${platform} access token expired. Please reconnect your ${platform} account.`,
              });
              results.push({ post_id: post.id, platform, status: "failed", error: "Token expired" });
              continue;
            }

            // Resolve image URL if it's a storage path
            let resolvedImageUrl = post.image_url;
            if (resolvedImageUrl && !resolvedImageUrl.startsWith("http")) {
              const bucket = "content";
              const { data: signedData } = await supabase.storage
                .from(bucket)
                .createSignedUrl(resolvedImageUrl, 3600);
              if (signedData?.signedUrl) {
                resolvedImageUrl = signedData.signedUrl;
              }
            }

            // Also resolve video output if present
            let resolvedVideoUrl: string | null = null;
            if (post.video_output_id) {
              const { data: videoOutput } = await supabase
                .from("video_outputs")
                .select("url")
                .eq("id", post.video_output_id)
                .single();
              if (videoOutput?.url && !videoOutput.url.startsWith("http")) {
                const { data: signedData } = await supabase.storage
                  .from("videos")
                  .createSignedUrl(videoOutput.url, 3600);
                if (signedData?.signedUrl) {
                  resolvedVideoUrl = signedData.signedUrl;
                }
              } else if (videoOutput?.url) {
                resolvedVideoUrl = videoOutput.url;
              }
            }

            // Attempt platform-specific publishing
            const publishResult = await publishToPlatform({
              platform,
              accessToken: connection.access_token_encrypted || "",
              platformUserId: connection.platform_user_id || "",
              content: post.content || "",
              imageUrl: resolvedImageUrl,
              videoUrl: resolvedVideoUrl,
              hashtags: post.hashtags || [],
            });

            // Record the social_post
            await supabase.from("social_posts").insert({
              user_id: post.user_id,
              scheduled_post_id: post.id,
              connection_id: connection.id,
              content: post.content,
              image_url: post.image_url,
              status: publishResult.success ? "published" : "failed",
              platform_post_id: publishResult.platformPostId || null,
              published_at: publishResult.success ? new Date().toISOString() : null,
              error_message: publishResult.error || null,
            });

            results.push({
              post_id: post.id,
              platform,
              status: publishResult.success ? "published" : "failed",
              error: publishResult.error,
            });

          } catch (platformErr) {
            const errMsg = platformErr instanceof Error ? platformErr.message : "Unknown platform error";
            await supabase.from("social_posts").insert({
              user_id: post.user_id,
              scheduled_post_id: post.id,
              content: post.content,
              status: "failed",
              error_message: errMsg,
            });
            results.push({ post_id: post.id, platform, status: "failed", error: errMsg });
          }
        }

        // Update the scheduled_post status based on results
        const postResults = results.filter(r => r.post_id === post.id);
        const allSucceeded = postResults.every(r => r.status === "published");
        const anySucceeded = postResults.some(r => r.status === "published");

        await supabase.from("scheduled_posts").update({
          status: allSucceeded ? "published" : anySucceeded ? "partial" : "failed",
        }).eq("id", post.id);
      }

      return new Response(JSON.stringify({
        processed: duePosts.length,
        results,
        summary: {
          published: results.filter(r => r.status === "published").length,
          failed: results.filter(r => r.status === "failed").length,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "retry") {
      const { social_post_id } = body;
      if (!social_post_id) {
        return new Response(JSON.stringify({ error: "social_post_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch the failed social_post
      const { data: socialPost, error: spError } = await supabase
        .from("social_posts")
        .select("*, scheduled_posts!social_posts_scheduled_post_id_fkey(*)")
        .eq("id", social_post_id)
        .single();

      if (spError || !socialPost) {
        return new Response(JSON.stringify({ error: "Social post not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!socialPost.connection_id) {
        return new Response(JSON.stringify({ error: "No social connection linked. Please connect your account first." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch connection
      const { data: connection } = await supabase
        .from("social_connections")
        .select("*")
        .eq("id", socialPost.connection_id)
        .single();

      if (!connection) {
        return new Response(JSON.stringify({ error: "Social connection not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Retry publishing
      const publishResult = await publishToPlatform({
        platform: connection.platform,
        accessToken: connection.access_token_encrypted || "",
        platformUserId: connection.platform_user_id || "",
        content: socialPost.content || "",
        imageUrl: socialPost.image_url,
        videoUrl: null,
        hashtags: [],
      });

      // Update the social_post
      await supabase.from("social_posts").update({
        status: publishResult.success ? "published" : "failed",
        platform_post_id: publishResult.platformPostId || null,
        published_at: publishResult.success ? new Date().toISOString() : null,
        error_message: publishResult.error || null,
        retry_count: (socialPost.retry_count || 0) + 1,
      }).eq("id", social_post_id);

      return new Response(JSON.stringify({
        success: publishResult.success,
        error: publishResult.error,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "status") {
      const { scheduled_post_id } = body;
      if (!scheduled_post_id) {
        return new Response(JSON.stringify({ error: "scheduled_post_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: posts, error } = await supabase
        .from("social_posts")
        .select("*")
        .eq("scheduled_post_id", scheduled_post_id);

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ posts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'process', 'retry', or 'status'." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (err) {
    console.error("publish-posts error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Platform-specific publishing logic.
 * Each platform has its own API flow.
 */
interface PublishParams {
  platform: string;
  accessToken: string;
  platformUserId: string;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  hashtags: string[];
}

interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
}

async function publishToPlatform(params: PublishParams): Promise<PublishResult> {
  const { platform, accessToken, platformUserId, content, imageUrl, videoUrl, hashtags } = params;

  if (!accessToken) {
    return { success: false, error: `No access token for ${platform}. Please reconnect your account.` };
  }

  const fullContent = hashtags.length > 0
    ? `${content}\n\n${hashtags.map(h => h.startsWith("#") ? h : `#${h}`).join(" ")}`
    : content;

  try {
    switch (platform.toLowerCase()) {
      case "instagram": {
        // Instagram Graph API — Container-based publishing
        // Step 1: Create media container
        const containerParams: Record<string, string> = {
          caption: fullContent,
          access_token: accessToken,
        };

        if (videoUrl) {
          containerParams.media_type = "REELS";
          containerParams.video_url = videoUrl;
        } else if (imageUrl) {
          containerParams.image_url = imageUrl;
        } else {
          return { success: false, error: "Instagram requires an image or video" };
        }

        const containerUrl = `https://graph.facebook.com/v19.0/${platformUserId}/media`;
        const containerResponse = await fetch(containerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(containerParams),
        });

        if (!containerResponse.ok) {
          const errData = await containerResponse.json();
          return { success: false, error: `Instagram API: ${errData.error?.message || containerResponse.statusText}` };
        }

        const containerData = await containerResponse.json();
        const containerId = containerData.id;

        // For video, wait for processing
        if (videoUrl) {
          let ready = false;
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 5000));
            const statusResp = await fetch(
              `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`
            );
            const statusData = await statusResp.json();
            if (statusData.status_code === "FINISHED") { ready = true; break; }
            if (statusData.status_code === "ERROR") {
              return { success: false, error: "Instagram video processing failed" };
            }
          }
          if (!ready) return { success: false, error: "Instagram video processing timed out" };
        }

        // Step 2: Publish the container
        const publishUrl = `https://graph.facebook.com/v19.0/${platformUserId}/media_publish`;
        const publishResponse = await fetch(publishUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: accessToken,
          }),
        });

        if (!publishResponse.ok) {
          const errData = await publishResponse.json();
          return { success: false, error: `Instagram publish: ${errData.error?.message || publishResponse.statusText}` };
        }

        const publishData = await publishResponse.json();
        return { success: true, platformPostId: publishData.id };
      }

      case "tiktok": {
        // TikTok Content Posting API v2
        if (!videoUrl) {
          return { success: false, error: "TikTok requires a video" };
        }

        // Initialize the upload
        const initResponse = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_info: {
              title: fullContent.slice(0, 150),
              privacy_level: "SELF_ONLY", // Default to private, user can change
              disable_duet: false,
              disable_stitch: false,
              disable_comment: false,
            },
            source_info: {
              source: "PULL_FROM_URL",
              video_url: videoUrl,
            },
          }),
        });

        if (!initResponse.ok) {
          const errData = await initResponse.json();
          return { success: false, error: `TikTok API: ${errData.error?.message || initResponse.statusText}` };
        }

        const initData = await initResponse.json();
        return { success: true, platformPostId: initData.data?.publish_id };
      }

      case "youtube": {
        // YouTube Data API v3 — resumable upload
        if (!videoUrl) {
          return { success: false, error: "YouTube requires a video" };
        }

        // Step 1: Start resumable upload session
        const metadata = {
          snippet: {
            title: fullContent.slice(0, 100) || "Untitled",
            description: fullContent,
            tags: hashtags.map(h => h.replace("#", "")),
            categoryId: "22", // People & Blogs
          },
          status: {
            privacyStatus: "private", // Default to private
            selfDeclaredMadeForKids: false,
          },
        };

        const initResponse = await fetch(
          "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(metadata),
          }
        );

        if (!initResponse.ok) {
          const errData = await initResponse.json();
          return { success: false, error: `YouTube API: ${errData.error?.message || initResponse.statusText}` };
        }

        const uploadUrl = initResponse.headers.get("location");
        if (!uploadUrl) {
          return { success: false, error: "YouTube did not return upload URL" };
        }

        // Step 2: Download the video and upload to YouTube
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
          return { success: false, error: "Failed to download video for YouTube upload" };
        }
        const videoBlob = await videoResponse.blob();

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "video/mp4",
            "Content-Length": videoBlob.size.toString(),
          },
          body: videoBlob,
        });

        if (!uploadResponse.ok) {
          return { success: false, error: `YouTube upload failed: ${uploadResponse.statusText}` };
        }

        const uploadData = await uploadResponse.json();
        return { success: true, platformPostId: uploadData.id };
      }

      case "twitter":
      case "x": {
        // Twitter/X API v2
        const tweetPayload: Record<string, unknown> = { text: fullContent };

        // If there's an image, upload it first
        if (imageUrl) {
          // Download image for upload to Twitter media endpoint
          const imgResp = await fetch(imageUrl);
          if (imgResp.ok) {
            const imgBlob = await imgResp.blob();
            const formData = new FormData();
            formData.append("media", imgBlob);

            const mediaResp = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
              method: "POST",
              headers: { "Authorization": `Bearer ${accessToken}` },
              body: formData,
            });

            if (mediaResp.ok) {
              const mediaData = await mediaResp.json();
              tweetPayload.media = { media_ids: [mediaData.media_id_string] };
            }
          }
        }

        const tweetResp = await fetch("https://api.twitter.com/2/tweets", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tweetPayload),
        });

        if (!tweetResp.ok) {
          const errData = await tweetResp.json();
          return { success: false, error: `X/Twitter API: ${errData.detail || errData.title || tweetResp.statusText}` };
        }

        const tweetData = await tweetResp.json();
        return { success: true, platformPostId: tweetData.data?.id };
      }

      case "linkedin": {
        // LinkedIn API
        const postPayload = {
          author: `urn:li:person:${platformUserId}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: fullContent },
              shareMediaCategory: imageUrl ? "IMAGE" : "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        };

        const liResp = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postPayload),
        });

        if (!liResp.ok) {
          const errData = await liResp.json();
          return { success: false, error: `LinkedIn API: ${errData.message || liResp.statusText}` };
        }

        const liData = await liResp.json();
        return { success: true, platformPostId: liData.id };
      }

      default:
        return { success: false, error: `Unsupported platform: ${platform}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown publishing error" };
  }
}
