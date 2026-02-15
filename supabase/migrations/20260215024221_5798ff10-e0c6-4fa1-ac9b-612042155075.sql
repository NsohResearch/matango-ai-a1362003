
-- ═══════════════════════════════════════════════════════════════════
-- MATANGO FULL PIPELINE SCHEMA (PostgreSQL/Supabase adaptation)
-- media_objects → model_registry → training_jobs → render_jobs
-- ═══════════════════════════════════════════════════════════════════

-- 1. MEDIA OBJECTS — permanent storage references (never store signed URLs)
CREATE TABLE IF NOT EXISTS public.media_objects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.business_dna(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video', 'audio', 'document')),
  bucket TEXT NOT NULL,
  object_key TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  sha256 TEXT,
  width INT,
  height INT,
  duration_ms INT,
  content_tags JSONB DEFAULT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bucket, object_key)
);

CREATE INDEX IF NOT EXISTS idx_media_org_brand ON public.media_objects(org_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media_objects(type);
CREATE INDEX IF NOT EXISTS idx_media_user ON public.media_objects(user_id);
CREATE INDEX IF NOT EXISTS idx_media_created ON public.media_objects(created_at DESC);

ALTER TABLE public.media_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media" ON public.media_objects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media" ON public.media_objects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media" ON public.media_objects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON public.media_objects
  FOR DELETE USING (auth.uid() = user_id);

-- 2. MODEL REGISTRY — trained model tracking
CREATE TABLE IF NOT EXISTS public.model_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.business_dna(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  provider_model_id TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'lora' CHECK (type IN ('lora', 'checkpoint', 'embedding')),
  provider TEXT NOT NULL DEFAULT 'lovable-ai',
  status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'active', 'archived', 'failed')),
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_model_org_brand ON public.model_registry(org_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_model_status ON public.model_registry(status);

ALTER TABLE public.model_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own models" ON public.model_registry
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own models" ON public.model_registry
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own models" ON public.model_registry
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. TRAINING JOBS — real job tracking for model training
CREATE TABLE IF NOT EXISTS public.training_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.business_dna(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retrying', 'cancelled')),
  input_media_object_ids JSONB NOT NULL DEFAULT '[]',
  output_model_registry_id UUID REFERENCES public.model_registry(id) ON DELETE SET NULL,
  progress SMALLINT NOT NULL DEFAULT 0,
  provider_job_id TEXT,
  logs JSONB DEFAULT '[]',
  error_message TEXT,
  credit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  retry_count SMALLINT NOT NULL DEFAULT 0,
  max_retries SMALLINT NOT NULL DEFAULT 2,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_status ON public.training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_training_user ON public.training_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_influencer ON public.training_jobs(influencer_id);

ALTER TABLE public.training_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training jobs" ON public.training_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training jobs" ON public.training_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training jobs" ON public.training_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. RENDER JOBS — real job tracking for video rendering
CREATE TABLE IF NOT EXISTS public.render_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.business_dna(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  output_id UUID REFERENCES public.video_outputs(id) ON DELETE CASCADE,
  video_job_id UUID REFERENCES public.video_jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image_to_video' CHECK (type IN ('script_to_video', 'image_to_video')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retrying', 'cancelled')),
  progress SMALLINT NOT NULL DEFAULT 0,
  provider_job_id TEXT,
  params JSONB DEFAULT NULL,
  logs JSONB DEFAULT '[]',
  error_message TEXT,
  retry_count SMALLINT NOT NULL DEFAULT 0,
  max_retries SMALLINT NOT NULL DEFAULT 3,
  estimated_duration_ms INT,
  actual_duration_ms INT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_render_status ON public.render_jobs(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_render_user ON public.render_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_render_output ON public.render_jobs(output_id);
CREATE INDEX IF NOT EXISTS idx_render_video_job ON public.render_jobs(video_job_id);

ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own render jobs" ON public.render_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own render jobs" ON public.render_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own render jobs" ON public.render_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Add missing columns to existing tables for pipeline integration

-- Add media_object reference to influencers
ALTER TABLE public.influencers
  ADD COLUMN IF NOT EXISTS model_registry_id UUID REFERENCES public.model_registry(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS character_weight NUMERIC(3,2) DEFAULT 0.85,
  ADD COLUMN IF NOT EXISTS keep_outfit BOOLEAN NOT NULL DEFAULT FALSE;

-- Add hashtags and multi-platform to scheduled_posts
ALTER TABLE public.scheduled_posts
  ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS anomaly_flag JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS video_output_id UUID REFERENCES public.video_outputs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.asset_library(id) ON DELETE SET NULL;

-- Add platform breakdown fields to analytics_events
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS value NUMERIC(14,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.unified_campaigns(id) ON DELETE SET NULL;

-- Add asset_id to social_posts for tracking
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS retry_count SMALLINT DEFAULT 0;

-- Update triggers for new tables
CREATE TRIGGER update_media_objects_updated_at
  BEFORE UPDATE ON public.media_objects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_model_registry_updated_at
  BEFORE UPDATE ON public.model_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_jobs_updated_at
  BEFORE UPDATE ON public.training_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_render_jobs_updated_at
  BEFORE UPDATE ON public.render_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
