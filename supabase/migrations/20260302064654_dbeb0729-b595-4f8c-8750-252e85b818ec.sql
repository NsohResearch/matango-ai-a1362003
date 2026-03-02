
-- Phase 1: Fix Storage Pattern — media_object_id FKs + indexes
-- media_objects already exists with user_id, bucket, object_key, etc.
-- Add missing columns for richer metadata
ALTER TABLE public.media_objects 
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add media_object_id FK columns to tables that currently store signed URLs
ALTER TABLE public.influencers 
  ADD COLUMN IF NOT EXISTS avatar_media_object_id uuid REFERENCES public.media_objects(id);

ALTER TABLE public.influencer_content 
  ADD COLUMN IF NOT EXISTS media_object_id uuid REFERENCES public.media_objects(id);

ALTER TABLE public.asset_library 
  ADD COLUMN IF NOT EXISTS media_object_id uuid REFERENCES public.media_objects(id);

ALTER TABLE public.video_outputs 
  ADD COLUMN IF NOT EXISTS media_object_id uuid REFERENCES public.media_objects(id);

ALTER TABLE public.campaign_scenes 
  ADD COLUMN IF NOT EXISTS media_object_id uuid REFERENCES public.media_objects(id);

-- Indexes on all new FK columns
CREATE INDEX IF NOT EXISTS idx_influencers_avatar_mo ON public.influencers(avatar_media_object_id);
CREATE INDEX IF NOT EXISTS idx_influencer_content_mo ON public.influencer_content(media_object_id);
CREATE INDEX IF NOT EXISTS idx_asset_library_mo ON public.asset_library(media_object_id);
CREATE INDEX IF NOT EXISTS idx_video_outputs_mo ON public.video_outputs(media_object_id);
CREATE INDEX IF NOT EXISTS idx_campaign_scenes_mo ON public.campaign_scenes(media_object_id);

-- Phase 2: Render caps table
CREATE TABLE IF NOT EXISTS public.render_caps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_job_id uuid REFERENCES public.video_jobs(id),
  final_render_count integer NOT NULL DEFAULT 0,
  max_final_renders integer NOT NULL DEFAULT 3,
  is_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.render_caps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own render caps" ON public.render_caps
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_render_caps_user ON public.render_caps(user_id);
CREATE INDEX IF NOT EXISTS idx_render_caps_job ON public.render_caps(video_job_id);

-- Atomic increment function with FOR UPDATE lock
CREATE OR REPLACE FUNCTION public.increment_render_count(p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
  v_max integer;
BEGIN
  SELECT final_render_count, max_final_renders
  INTO v_count, v_max
  FROM render_caps
  WHERE video_job_id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Auto-create cap row
    INSERT INTO render_caps (user_id, video_job_id, final_render_count, max_final_renders)
    SELECT vj.user_id, vj.id, 1, 3
    FROM video_jobs vj WHERE vj.id = p_job_id;
    RETURN true;
  END IF;

  IF v_count >= v_max THEN
    RETURN false;
  END IF;

  UPDATE render_caps SET final_render_count = final_render_count + 1, updated_at = now()
  WHERE video_job_id = p_job_id;
  RETURN true;
END;
$$;

-- Double-entry credit ledger improvements
ALTER TABLE public.credit_ledger
  ADD COLUMN IF NOT EXISTS debit numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credit_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_after numeric,
  ADD COLUMN IF NOT EXISTS reference_type text,
  ADD COLUMN IF NOT EXISTS reference_id uuid,
  ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_idempotency 
  ON public.credit_ledger(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Atomic credit deduction with idempotency
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_credits numeric;
  v_new_balance numeric;
  v_ledger_id uuid;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_ledger_id FROM credit_ledger WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN jsonb_build_object('success', true, 'idempotent', true, 'ledger_id', v_ledger_id);
    END IF;
  END IF;

  -- Lock the user's profile row
  SELECT credits INTO v_current_credits FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  IF v_current_credits < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits', 'balance', v_current_credits, 'required', p_amount);
  END IF;

  v_new_balance := v_current_credits - p_amount;

  UPDATE profiles SET credits = v_new_balance, updated_at = now() WHERE user_id = p_user_id;

  INSERT INTO credit_ledger (user_id, delta, debit, balance_after, reason, reference_type, reference_id, idempotency_key)
  VALUES (p_user_id, -p_amount, p_amount, v_new_balance, p_reason, p_reference_type, p_reference_id, p_idempotency_key)
  RETURNING id INTO v_ledger_id;

  RETURN jsonb_build_object('success', true, 'balance', v_new_balance, 'ledger_id', v_ledger_id);
END;
$$;

-- Credit refund function
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_balance numeric;
  v_ledger_id uuid;
BEGIN
  UPDATE profiles SET credits = credits + p_amount, updated_at = now() 
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_balance;

  INSERT INTO credit_ledger (user_id, delta, credit_amount, balance_after, reason, reference_type, reference_id)
  VALUES (p_user_id, p_amount, p_amount, v_new_balance, p_reason, p_reference_type, p_reference_id)
  RETURNING id INTO v_ledger_id;

  RETURN jsonb_build_object('success', true, 'balance', v_new_balance, 'ledger_id', v_ledger_id);
END;
$$;

-- Phase 3: Extend render_jobs for async architecture
ALTER TABLE public.render_jobs
  ADD COLUMN IF NOT EXISTS provider_name text,
  ADD COLUMN IF NOT EXISTS provider_model text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_code text,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz,
  ADD COLUMN IF NOT EXISTS input_media_object_id uuid REFERENCES public.media_objects(id),
  ADD COLUMN IF NOT EXISTS output_media_object_id uuid REFERENCES public.media_objects(id),
  ADD COLUMN IF NOT EXISTS credit_cost numeric,
  ADD COLUMN IF NOT EXISTS credit_ledger_id uuid,
  ADD COLUMN IF NOT EXISTS aspect_ratio text,
  ADD COLUMN IF NOT EXISTS quality_tier text,
  ADD COLUMN IF NOT EXISTS is_preview boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Indexes for async polling
CREATE INDEX IF NOT EXISTS idx_render_jobs_pending 
  ON public.render_jobs(status, submitted_at) 
  WHERE status IN ('queued', 'submitted', 'processing');

CREATE INDEX IF NOT EXISTS idx_render_jobs_retry 
  ON public.render_jobs(next_retry_at) 
  WHERE status = 'retry_scheduled';

-- Provider health tracking
ALTER TABLE public.provider_routing_rules
  ADD COLUMN IF NOT EXISTS health_status text DEFAULT 'healthy',
  ADD COLUMN IF NOT EXISTS last_health_check timestamptz,
  ADD COLUMN IF NOT EXISTS failure_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_failures_before_disable integer DEFAULT 5;
