
-- Extend video_providers with governance columns
ALTER TABLE public.video_providers
  ADD COLUMN IF NOT EXISTS global_status text NOT NULL DEFAULT 'enabled',
  ADD COLUMN IF NOT EXISTS business_status_reason text,
  ADD COLUMN IF NOT EXISTS allowed_plans text[] DEFAULT '{free,basic,agency,agency_plus}',
  ADD COLUMN IF NOT EXISTS region_constraints text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sla_tier text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS cost_multiplier numeric DEFAULT 1.0;

-- Extend provider_models with cost and fallback columns
ALTER TABLE public.provider_models
  ADD COLUMN IF NOT EXISTS cost_multiplier numeric DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS fallback_priority integer DEFAULT 0;

-- Extend provider_routing_rules with fallback provider list
ALTER TABLE public.provider_routing_rules
  ADD COLUMN IF NOT EXISTS fallback_provider_ids uuid[] DEFAULT '{}';
