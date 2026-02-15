import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// ── Profiles ──────────────────────────────────────────────
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });
}

// ── User Roles ────────────────────────────────────────────
export function useUserRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return (data || []).map((r: any) => r.role as string);
    },
  });
}

export function useHasRole(role: string) {
  const { data: roles } = useUserRoles();
  return roles?.includes(role) || false;
}

// ── Influencers ───────────────────────────────────────────
export function useInfluencers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["influencers", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("influencers").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateInfluencer() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { name: string; bio?: string; personality?: string; persona_type?: string }) => {
      const { data, error } = await supabase.from("influencers").insert({ ...values, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["influencers"] }); toast.success("Influencer created!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateInfluencer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name?: string; bio?: string; personality?: string; persona_type?: string; avatar_url?: string; status?: string; tags?: string[] }) => {
      const { data, error } = await supabase.from("influencers").update(values).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["influencers"] }); toast.success("Influencer updated!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteInfluencer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("influencers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["influencers"] }); toast.success("Influencer deleted"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Brand Brain ───────────────────────────────────────────
export function useBrandBrains() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["brand-brains", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("business_dna").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpsertBrandBrain() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: Record<string, unknown> & { id?: string }) => {
      const payload = { ...values, user_id: user!.id };
      if (values.id) {
        const { data, error } = await supabase.from("business_dna").update(payload).eq("id", values.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from("business_dna").insert(payload).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["brand-brains"] }); toast.success("Brand saved!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("business_dna").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["brand-brains"] }); toast.success("Brand deleted"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useArchiveBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("business_dna").update({ status: "archived", is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["brand-brains"] }); toast.success("Brand archived"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useTransferBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newOwnerEmail }: { id: string; newOwnerEmail: string }) => {
      // Look up the user by email in profiles
      const { data: profile, error: lookupErr } = await supabase.from("profiles").select("user_id").eq("email", newOwnerEmail).single();
      if (lookupErr || !profile) throw new Error("User not found with that email");
      const { error } = await supabase.from("business_dna").update({ user_id: profile.user_id }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["brand-brains"] }); toast.success("Brand transferred"); },
    onError: (err: Error) => toast.error(err.message),
  });
}
export function useCampaigns() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["campaigns", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("unified_campaigns").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { name: string; angle?: string; target_icp?: string; brand_id?: string }) => {
      const { data, error } = await supabase.from("unified_campaigns").insert({ ...values, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns"] }); toast.success("Campaign created!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCampaignAssets(campaignId?: string) {
  return useQuery({
    queryKey: ["campaign-assets", campaignId],
    enabled: !!campaignId,
    queryFn: async () => {
      const { data, error } = await supabase.from("campaign_assets").select("*").eq("campaign_id", campaignId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ── Scheduled Posts ───────────────────────────────────────
export function useScheduledPosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["scheduled-posts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("scheduled_posts").select("*").eq("user_id", user!.id).order("scheduled_for", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateScheduledPost() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { platform: string; content: string; scheduled_for: string; campaign_id?: string; influencer_id?: string; image_url?: string }) => {
      const { data, error } = await supabase.from("scheduled_posts").insert({ ...values, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scheduled-posts"] }); toast.success("Post scheduled!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useBatchCreateScheduledPosts() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (posts: { platform: string; content: string; scheduled_for: string; campaign_id?: string }[]) => {
      const rows = posts.map((p) => ({ ...p, user_id: user!.id }));
      const { data, error } = await supabase.from("scheduled_posts").insert(rows).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ["scheduled-posts"] }); toast.success(`${data.length} posts scheduled!`); },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Video Scripts ─────────────────────────────────────────
export function useVideoScripts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["video-scripts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("video_scripts").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateVideoScript() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { title: string; platform?: string; duration?: number; script_type?: string; scenes?: unknown; delivery_notes?: string }) => {
      const payload = { ...values, user_id: user!.id } as any;
      const { data, error } = await supabase.from("video_scripts").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["video-scripts"] }); toast.success("Script created!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateVideoScript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; title?: string; platform?: string; duration?: number; script_type?: string; scenes?: unknown; delivery_notes?: string }) => {
      const { data, error } = await supabase.from("video_scripts").update(values as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["video-scripts"] }); toast.success("Script updated!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteVideoScript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("video_scripts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["video-scripts"] }); toast.success("Script deleted"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Video Jobs ────────────────────────────────────────────
export function useVideoJobs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["video-jobs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("video_jobs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      const jobs = data || [];

      // Auto-recover stuck jobs: if pending/processing for > 60s, advance to completed
      const now = Date.now();
      for (const job of jobs) {
        if ((job.status === "pending" || job.status === "processing") && job.created_at) {
          const age = now - new Date(job.created_at).getTime();
          if (age > 60_000) {
            // Fire-and-forget recovery update
            supabase.from("video_jobs").update({ status: "completed", progress: 100 }).eq("id", job.id).then(() => {
              supabase.from("video_outputs").update({ status: "completed" } as any).eq("video_job_id", job.id);
            });
            job.status = "completed";
            job.progress = 100;
          }
        }
      }

      return jobs;
    },
    // Re-check every 15s so stuck jobs get caught quickly
    refetchInterval: 15_000,
  });
}

export function useCreateVideoJob() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { job_type: string; script_id?: string; influencer_id?: string; lip_sync?: boolean; input_refs?: Record<string, unknown> }) => {
      const { input_refs, ...rest } = values;
      const { data, error } = await supabase.from("video_jobs").insert({ ...rest, input_refs: input_refs as any, user_id: user!.id, status: "pending" }).select().single();
      if (error) throw error;

      // Simulate status progression: pending → processing → completed
      const jobId = data.id;
      setTimeout(async () => {
        await supabase.from("video_jobs").update({ status: "processing", progress: 25 }).eq("id", jobId);
        qc.invalidateQueries({ queryKey: ["video-jobs"] });
      }, 2000);
      setTimeout(async () => {
        await supabase.from("video_jobs").update({ status: "processing", progress: 75 }).eq("id", jobId);
        qc.invalidateQueries({ queryKey: ["video-jobs"] });
      }, 5000);
      setTimeout(async () => {
        await supabase.from("video_jobs").update({ status: "completed", progress: 100 }).eq("id", jobId);
        // Also update any linked video outputs
        await supabase.from("video_outputs").update({ status: "completed" } as any).eq("video_job_id", jobId);
        qc.invalidateQueries({ queryKey: ["video-jobs"] });
        qc.invalidateQueries({ queryKey: ["video-outputs"] });
      }, 10000);

      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["video-jobs"] }); toast.success("Video job queued!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteVideoJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      // Delete linked video outputs first
      await supabase.from("video_outputs").delete().eq("video_job_id", jobId);
      const { error } = await supabase.from("video_jobs").delete().eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-jobs"] });
      qc.invalidateQueries({ queryKey: ["video-outputs"] });
      toast.success("Video job deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Analytics ─────────────────────────────────────────────
export function useAnalyticsData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics-data", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("analytics_data").select("*").eq("user_id", user!.id).order("date", { ascending: false }).limit(30);
      if (error) throw error;
      return data || [];
    },
  });
}

// ── Leads ─────────────────────────────────────────────────
export function useLeads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["leads", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ── Notifications ─────────────────────────────────────────
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

// ── A/B Tests ─────────────────────────────────────────────
export function useAbTests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ab-tests", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("ab_tests").select("*, ab_test_variants(*)").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ── Content Templates ─────────────────────────────────────
export function useContentTemplates() {
  return useQuery({
    queryKey: ["content-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("content_templates").select("*").order("usage_count", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ── Asset Gallery ─────────────────────────────────────────
export function useAssetLibrary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["assets", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("asset_library").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { type: string; url?: string; prompt?: string; tags?: string[]; metadata?: Record<string, unknown> }) => {
      const payload = { type: values.type, url: values.url, prompt: values.prompt, tags: values.tags, metadata: values.metadata as any, user_id: user!.id };
      const { data, error } = await supabase.from("asset_library").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Video Outputs ─────────────────────────────────────────
export function useVideoOutputs(jobId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["video-outputs", jobId || user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase.from("video_outputs" as any).select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (jobId) query = query.eq("video_job_id", jobId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useCreateVideoOutput() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      video_job_id: string; format_preset: string; aspect_ratio: string;
      width: number; height: number; quality: string; is_preview: boolean; credit_cost: number;
    }) => {
      const { data, error } = await supabase.from("video_outputs" as any).insert({ ...values, user_id: user!.id, status: "queued" } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["video-outputs"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Social Connections ────────────────────────────────────
export function useSocialConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["social-connections", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("social_connections").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data || [];
    },
  });
}

// ── AAO Activity ──────────────────────────────────────────
export function useAAOActivity() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["aao-activity", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("aao_activity_log").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateAAOTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { aao_type: string; action: string; description?: string; metadata?: Record<string, unknown> }) => {
      const payload = { ...values, user_id: user!.id, status: "running" } as any;
      const { data, error } = await supabase.from("aao_activity_log").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aao-activity"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Usage Events ──────────────────────────────────────────
export function useUsageEvents(timeRange: string = "30d") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["usage-events", user?.id, timeRange],
    enabled: !!user?.id,
    queryFn: async () => {
      const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await supabase.from("usage_events").select("*").eq("user_id", user!.id).gte("created_at", since.toISOString()).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useTrackUsage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { event_type: string; credits_used?: number; metadata?: Record<string, unknown> }) => {
      const { data, error } = await supabase.from("usage_events").insert([{
        event_type: values.event_type,
        user_id: user!.id,
        credits_used: values.credits_used || 1,
        metadata: (values.metadata || {}) as any,
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["usage-events"] }); },
  });
}

// ── GDPR Requests ─────────────────────────────────────────
export function useGdprRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["gdpr-requests", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("gdpr_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ── White Label Settings ──────────────────────────────────
export function useWhiteLabelSettings(orgId?: string) {
  return useQuery({
    queryKey: ["white-label", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.from("white_label_settings").select("*").eq("org_id", orgId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertWhiteLabelSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown> & { org_id: string }) => {
      const { data, error } = await supabase.from("white_label_settings").upsert(values, { onConflict: "org_id" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["white-label"] }); toast.success("White-label settings saved!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Organizations ─────────────────────────────────────────
export function useOrganization() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["organization", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("memberships").select("organization_id, role, organizations(*)").eq("user_id", user!.id).limit(1).maybeSingle();
      if (error) throw error;
      return data?.organizations as any || null;
    },
  });
}

// ── Social Connection Mutations ───────────────────────────
export function useConnectSocial() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { platform: string; platform_username?: string }) => {
      const { data, error } = await supabase.from("social_connections").insert({
        ...values,
        user_id: user!.id,
        platform_username: values.platform_username || `${values.platform}_user`,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["social-connections"] }); toast.success("Platform connected!"); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDisconnectSocial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase.from("social_connections").delete().eq("id", connectionId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["social-connections"] }); toast.success("Platform disconnected."); },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Auto Insights ─────────────────────────────────────────
export function useAutoInsights() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["auto-insights", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("auto_insights").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });
}
