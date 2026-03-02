
-- Social posts table
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scheduled_post_id uuid REFERENCES public.scheduled_posts(id),
  platform text NOT NULL,
  platform_post_id text,
  platform_url text,
  status text DEFAULT 'pending',
  error_message text,
  retry_count integer DEFAULT 0,
  published_at timestamptz,
  metrics jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own social posts" ON public.social_posts
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_social_posts_user ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON public.social_posts(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts(status, published_at);

-- Add columns to social_connections that may be missing
ALTER TABLE public.social_connections
  ADD COLUMN IF NOT EXISTS refresh_token text,
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS platform_user_id text,
  ADD COLUMN IF NOT EXISTS platform_username text,
  ADD COLUMN IF NOT EXISTS scopes text[],
  ADD COLUMN IF NOT EXISTS is_valid boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS connection_metadata jsonb DEFAULT '{}';

-- Add columns to scheduled_posts
ALTER TABLE public.scheduled_posts
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS media_object_id uuid REFERENCES public.media_objects(id),
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0;
