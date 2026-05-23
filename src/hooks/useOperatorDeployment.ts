import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface OperatorDeployment {
  id: string;
  org_id: string;
  user_id: string;
  operator_slug: string;
  industry_slug: string;
  display_name: string;
  status: string;
  phone_number: string | null;
  voice_id: string | null;
  language_primary: string;
  language_secondary: string | null;
  business_hours: any;
  service_area_geojson: any;
  service_area_zips: string[] | null;
  service_area_center: string | null;
  service_area_radius_miles: number | null;
  routing_matrix: any[];
  config: any;
  onboarding_progress: { phase: number; completed_steps: string[] };
}

export function useOperatorDeployment(operatorSlug: string, industrySlug: string) {
  const { user } = useAuth();
  const [deployment, setDeployment] = useState<OperatorDeployment | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("operator_deployments")
      .select("*")
      .eq("user_id", user.id)
      .eq("operator_slug", operatorSlug)
      .eq("industry_slug", industrySlug)
      .maybeSingle();
    setDeployment(data ?? null);
    setLoading(false);
  }, [user, operatorSlug, industrySlug]);

  useEffect(() => { load(); }, [load]);

  const ensure = useCallback(async (displayName: string) => {
    if (!user) return null;
    if (deployment) return deployment;
    // org lookup (first owned)
    const { data: org } = await (supabase as any).from("organizations").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
    const orgId = org?.id ?? user.id; // fallback
    const { data, error } = await (supabase as any)
      .from("operator_deployments")
      .insert({
        org_id: orgId,
        user_id: user.id,
        operator_slug: operatorSlug,
        industry_slug: industrySlug,
        display_name: displayName,
      })
      .select("*")
      .single();
    if (!error) setDeployment(data);
    return data;
  }, [user, deployment, operatorSlug, industrySlug]);

  const update = useCallback(async (patch: Partial<OperatorDeployment>) => {
    if (!deployment) return;
    const { data } = await (supabase as any)
      .from("operator_deployments")
      .update(patch)
      .eq("id", deployment.id)
      .select("*")
      .single();
    if (data) setDeployment(data);
  }, [deployment]);

  return { deployment, loading, reload: load, ensure, update };
}
