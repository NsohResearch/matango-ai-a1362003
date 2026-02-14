import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useInfluencers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["influencers", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencers")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
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
      const { data, error } = await supabase
        .from("influencers")
        .insert({ ...values, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["influencers"] });
      toast.success("Influencer created!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useBrandBrains() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["brand-brains", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_dna")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
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
        const { data, error } = await supabase
          .from("business_dna")
          .update(payload)
          .eq("id", values.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("business_dna")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brand-brains"] });
      toast.success("Brand saved!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCampaigns() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["campaigns", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unified_campaigns")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
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
      const { data, error } = await supabase
        .from("unified_campaigns")
        .insert({ ...values, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useScheduledPosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["scheduled-posts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAnalyticsData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics-data", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_data")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useVideoScripts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["video-scripts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_scripts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useLeads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["leads", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAbTests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ab-tests", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ab_tests")
        .select("*, ab_test_variants(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useContentTemplates() {
  return useQuery({
    queryKey: ["content-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_templates")
        .select("*")
        .order("usage_count", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAssetLibrary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["assets", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_library")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSocialConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["social-connections", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_connections")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useVideoJobs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["video-jobs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_jobs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}
