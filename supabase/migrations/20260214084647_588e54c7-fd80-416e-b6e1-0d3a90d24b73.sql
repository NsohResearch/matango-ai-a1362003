
-- Account lifecycle status enums
DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('active', 'paused', 'soft_deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.billing_status AS ENUM ('active', 'billing_stopped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.lifecycle_action AS ENUM ('pause', 'unpause', 'stop_billing', 'downgrade', 'soft_delete', 'restore', 'hard_delete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add lifecycle columns to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS billing_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS paused_reason text,
  ADD COLUMN IF NOT EXISTS soft_deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS hard_delete_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS restored_at timestamptz;

-- Account lifecycle events audit table
CREATE TABLE IF NOT EXISTS public.account_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  actor_user_id uuid NOT NULL,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_lifecycle_events ENABLE ROW LEVEL SECURITY;

-- Only admins and org owners can view lifecycle events
CREATE POLICY "Org owners can view lifecycle events"
  ON public.account_lifecycle_events FOR SELECT
  USING (
    actor_user_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR public.is_org_member(auth.uid(), org_id)
  );

-- Insert only via service role / edge functions (no direct user insert)
CREATE POLICY "Service role inserts lifecycle events"
  ON public.account_lifecycle_events FOR INSERT
  WITH CHECK (actor_user_id = auth.uid());

-- Deletion jobs table for scheduled hard deletes
CREATE TABLE IF NOT EXISTS public.deletion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  scheduled_for timestamptz NOT NULL,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.deletion_jobs ENABLE ROW LEVEL SECURITY;

-- Only admins can view deletion jobs
CREATE POLICY "Admins can view deletion jobs"
  ON public.deletion_jobs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage deletion jobs"
  ON public.deletion_jobs FOR ALL
  USING (public.is_admin(auth.uid()));
