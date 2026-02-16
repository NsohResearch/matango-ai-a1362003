
-- ═══════════════════════════════════════════════════════════
-- VIDEO STUDIO 2.0 — Provider Hub + Extended Schema
-- ═══════════════════════════════════════════════════════════

-- 1) video_providers — First-party & BYO provider registry
CREATE TABLE public.video_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  provider_type text NOT NULL DEFAULT 'first_party' CHECK (provider_type IN ('first_party','byo_api')),
  supports_t2v boolean NOT NULL DEFAULT false,
  supports_i2v boolean NOT NULL DEFAULT false,
  supports_a2v boolean NOT NULL DEFAULT false,
  supports_retake boolean NOT NULL DEFAULT false,
  logo_url text,
  website_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read video providers" ON public.video_providers FOR SELECT USING (true);
CREATE POLICY "Admins manage video providers" ON public.video_providers FOR ALL USING (is_admin(auth.uid()));

-- 2) provider_models — Models available per provider
CREATE TABLE public.provider_models (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES public.video_providers(id) ON DELETE CASCADE,
  model_key text NOT NULL,
  display_name text NOT NULL,
  quality_tier text NOT NULL DEFAULT 'balanced' CHECK (quality_tier IN ('fast','balanced','cinematic')),
  modalities text[] NOT NULL DEFAULT '{}',
  max_seconds integer DEFAULT 30,
  max_resolution text DEFAULT '1920x1080',
  native_audio boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read provider models" ON public.provider_models FOR SELECT USING (true);
CREATE POLICY "Admins manage provider models" ON public.provider_models FOR ALL USING (is_admin(auth.uid()));

-- 3) org_provider_keys — BYO API key storage per org
CREATE TABLE public.org_provider_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.video_providers(id) ON DELETE CASCADE,
  encrypted_secret_ref text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_rotated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, provider_id)
);

ALTER TABLE public.org_provider_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org owners manage provider keys" ON public.org_provider_keys FOR ALL
  USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = org_provider_keys.org_id AND organizations.owner_id = auth.uid()));
CREATE POLICY "Org members view provider keys" ON public.org_provider_keys FOR SELECT
  USING (is_org_member(auth.uid(), org_id));

-- 4) video_assets — Unified asset tracking for video outputs
CREATE TABLE public.video_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid REFERENCES public.organizations(id),
  user_id uuid NOT NULL,
  job_id uuid REFERENCES public.video_jobs(id) ON DELETE SET NULL,
  asset_type text NOT NULL DEFAULT 'video',
  storage_path text,
  thumb_path text,
  metadata_json jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own video assets" ON public.video_assets FOR ALL USING (auth.uid() = user_id);

-- 5) video_versions — Version tracking for retakes
CREATE TABLE public.video_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_asset_id uuid NOT NULL REFERENCES public.video_assets(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  job_id uuid REFERENCES public.video_jobs(id) ON DELETE SET NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own video versions" ON public.video_versions FOR ALL
  USING (EXISTS (SELECT 1 FROM video_assets WHERE video_assets.id = video_versions.parent_asset_id AND video_assets.user_id = auth.uid()));

-- 6) provider_routing_rules — Admin-configurable routing
CREATE TABLE public.provider_routing_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modality text NOT NULL,
  quality_tier text NOT NULL,
  primary_provider_id uuid REFERENCES public.video_providers(id),
  fallback_provider_ids uuid[] DEFAULT '{}',
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_routing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read routing rules" ON public.provider_routing_rules FOR SELECT USING (true);
CREATE POLICY "Admins manage routing rules" ON public.provider_routing_rules FOR ALL USING (is_admin(auth.uid()));

-- 7) video_quotas — Per-org usage quotas
CREATE TABLE public.video_quotas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  daily_seconds_limit integer NOT NULL DEFAULT 300,
  monthly_seconds_limit integer NOT NULL DEFAULT 3600,
  concurrent_jobs_limit integer NOT NULL DEFAULT 3,
  daily_seconds_used integer NOT NULL DEFAULT 0,
  monthly_seconds_used integer NOT NULL DEFAULT 0,
  last_daily_reset timestamptz DEFAULT now(),
  last_monthly_reset timestamptz DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view quotas" ON public.video_quotas FOR SELECT USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "Admins manage quotas" ON public.video_quotas FOR ALL USING (is_admin(auth.uid()));

-- 8) Extend video_jobs with provider tracking columns
ALTER TABLE public.video_jobs
  ADD COLUMN IF NOT EXISTS provider_id uuid REFERENCES public.video_providers(id),
  ADD COLUMN IF NOT EXISTS model_id uuid REFERENCES public.provider_models(id),
  ADD COLUMN IF NOT EXISTS quality_tier text DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS credits_estimated integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_charged integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retake_parent_id uuid REFERENCES public.video_jobs(id);

-- 9) Seed first-party providers
INSERT INTO public.video_providers (name, slug, provider_type, supports_t2v, supports_i2v, supports_a2v, supports_retake, status) VALUES
  ('LTX Video', 'ltx', 'first_party', true, true, false, false, 'active'),
  ('OpenAI Sora', 'openai-sora', 'first_party', true, true, false, true, 'coming_soon'),
  ('Google Veo', 'google-veo', 'first_party', true, true, true, false, 'coming_soon'),
  ('Kling AI', 'kling', 'byo_api', true, true, false, true, 'active'),
  ('Runway', 'runway', 'byo_api', true, true, false, true, 'active'),
  ('Hedra', 'hedra', 'byo_api', false, false, true, false, 'active'),
  ('Luma Dream Machine', 'luma', 'byo_api', true, true, false, false, 'active');

-- 10) Seed provider models
INSERT INTO public.provider_models (provider_id, model_key, display_name, quality_tier, modalities, max_seconds, max_resolution, native_audio) VALUES
  ((SELECT id FROM video_providers WHERE slug='ltx'), 'ltx-video-2', 'LTX-2', 'balanced', '{t2v,i2v}', 30, '1280x720', false),
  ((SELECT id FROM video_providers WHERE slug='kling'), 'kling-v1', 'Kling v1', 'balanced', '{t2v,i2v}', 10, '1920x1080', false),
  ((SELECT id FROM video_providers WHERE slug='kling'), 'kling-v1-pro', 'Kling v1 Pro', 'cinematic', '{t2v,i2v,retake}', 30, '3840x2160', true),
  ((SELECT id FROM video_providers WHERE slug='runway'), 'gen-3-alpha', 'Gen-3 Alpha', 'cinematic', '{t2v,i2v,retake}', 16, '3840x2160', false),
  ((SELECT id FROM video_providers WHERE slug='hedra'), 'character-2', 'Character-2', 'balanced', '{a2v}', 60, '1920x1080', true),
  ((SELECT id FROM video_providers WHERE slug='luma'), 'dream-machine-1.5', 'Dream Machine 1.5', 'balanced', '{t2v,i2v}', 10, '1920x1080', false);

-- 11) Seed default routing rules
INSERT INTO public.provider_routing_rules (modality, quality_tier, primary_provider_id, priority) VALUES
  ('t2v', 'fast', (SELECT id FROM video_providers WHERE slug='ltx'), 10),
  ('t2v', 'balanced', (SELECT id FROM video_providers WHERE slug='ltx'), 10),
  ('t2v', 'cinematic', (SELECT id FROM video_providers WHERE slug='ltx'), 10),
  ('i2v', 'fast', (SELECT id FROM video_providers WHERE slug='ltx'), 10),
  ('i2v', 'balanced', (SELECT id FROM video_providers WHERE slug='ltx'), 10),
  ('i2v', 'cinematic', (SELECT id FROM video_providers WHERE slug='ltx'), 10),
  ('a2v', 'balanced', (SELECT id FROM video_providers WHERE slug='hedra'), 10),
  ('retake', 'balanced', (SELECT id FROM video_providers WHERE slug='kling'), 10);

-- 12) Video generation audit log
CREATE TABLE public.video_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid REFERENCES public.organizations(id),
  user_id uuid NOT NULL,
  action text NOT NULL,
  metadata_json jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own video audit" ON public.video_audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all video audit" ON public.video_audit_log FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "System inserts video audit" ON public.video_audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "No delete video audit" ON public.video_audit_log FOR DELETE USING (false);
CREATE POLICY "No update video audit" ON public.video_audit_log FOR UPDATE USING (false);
