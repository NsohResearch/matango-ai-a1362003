import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// ── Video Providers ──────────────────────────────────────
export function useVideoProviders() {
  return useQuery({
    queryKey: ["video-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_providers" as any)
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// ── Provider Models ──────────────────────────────────────
export function useProviderModels(providerId?: string) {
  return useQuery({
    queryKey: ["provider-models", providerId],
    queryFn: async () => {
      let query = supabase
        .from("provider_models" as any)
        .select("*, video_providers(*)")
        .eq("is_enabled", true)
        .order("display_name");
      if (providerId) query = query.eq("provider_id", providerId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// ── Routing Rules ────────────────────────────────────────
export function useRoutingRules() {
  return useQuery({
    queryKey: ["routing-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_routing_rules" as any)
        .select("*, video_providers(*)")
        .eq("is_active", true)
        .order("priority", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// ── Resolve provider for a given modality + tier ─────────
export function useResolveProvider() {
  const { data: rules } = useRoutingRules();
  const { data: providers } = useVideoProviders();

  return (modality: string, qualityTier: string) => {
    if (!rules || !providers) return null;
    const rule = rules.find(
      (r: any) => r.modality === modality && r.quality_tier === qualityTier
    );
    if (!rule) return null;
    const provider = providers.find((p: any) => p.id === rule.primary_provider_id);
    return provider || null;
  };
}

// ── Org Provider Keys ────────────────────────────────────
export function useOrgProviderKeys(orgId?: string) {
  return useQuery({
    queryKey: ["org-provider-keys", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_provider_keys" as any)
        .select("*, video_providers(*)")
        .eq("org_id", orgId!);
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// ── Video Assets ─────────────────────────────────────────
export function useVideoAssets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["video-assets", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_assets" as any)
        .select("*, video_versions(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// ── Video Versions ───────────────────────────────────────
export function useVideoVersions(assetId?: string) {
  return useQuery({
    queryKey: ["video-versions", assetId],
    enabled: !!assetId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_versions" as any)
        .select("*")
        .eq("parent_asset_id", assetId!)
        .order("version_number", { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// ── Video Quotas ─────────────────────────────────────────
export function useVideoQuotas(orgId?: string) {
  return useQuery({
    queryKey: ["video-quotas", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_quotas" as any)
        .select("*")
        .eq("org_id", orgId!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
}

// ── Video Audit Log ──────────────────────────────────────
export function useVideoAuditLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["video-audit", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_audit_log" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}
