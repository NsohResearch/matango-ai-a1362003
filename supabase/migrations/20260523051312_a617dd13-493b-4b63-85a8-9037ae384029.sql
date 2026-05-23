
-- Per-deployment secret vault (values stored encrypted at rest by Supabase)
CREATE TABLE public.operator_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'retell' | 'twilio' | 'jobnimbus' | 'acculynx' | 'hubspot' | 'google_maps' | etc
  key_name text NOT NULL,  -- e.g. 'api_key', 'account_sid', 'auth_token'
  value_encrypted text NOT NULL, -- ciphertext; edge function handles encrypt/decrypt
  last_four text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deployment_id, provider, key_name)
);
ALTER TABLE public.operator_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage deployment secrets" ON public.operator_secrets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all deployment secrets" ON public.operator_secrets
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE TRIGGER operator_secrets_updated
  BEFORE UPDATE ON public.operator_secrets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Outbound webhook subscriptions
CREATE TABLE public.operator_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}', -- 'call.completed','lead.created','emergency.flagged'...
  secret_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  last_status integer,
  last_fired_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.operator_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage webhooks" ON public.operator_webhooks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view webhooks" ON public.operator_webhooks
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE TRIGGER operator_webhooks_updated
  BEFORE UPDATE ON public.operator_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notification rules
CREATE TABLE public.operator_notification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  trigger text NOT NULL, -- 'emergency','hot_lead','missed_call','guardrail_trip','overage_80','overage_100'
  channel text NOT NULL, -- 'email','sms','slack','webhook'
  target text NOT NULL,  -- email addr / phone / slack webhook / webhook id
  is_active boolean NOT NULL DEFAULT true,
  cooldown_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.operator_notification_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage notification rules" ON public.operator_notification_rules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view notification rules" ON public.operator_notification_rules
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE TRIGGER operator_notif_updated
  BEFORE UPDATE ON public.operator_notification_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Team members per deployment (GM, estimator, service mgr, etc.)
CREATE TABLE public.operator_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  invited_email text NOT NULL,
  invited_phone text,
  member_user_id uuid,
  role text NOT NULL DEFAULT 'viewer', -- 'owner','gm','estimator','service_manager','viewer'
  permissions jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'invited',
  invite_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deployment_id, invited_email)
);
ALTER TABLE public.operator_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage team" ON public.operator_team_members
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Invited members see self" ON public.operator_team_members
  FOR SELECT USING (auth.uid() = member_user_id);
CREATE POLICY "Admins view team rows" ON public.operator_team_members
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE TRIGGER operator_team_updated
  BEFORE UPDATE ON public.operator_team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Central sector packs admins curate, tenants opt in
CREATE TABLE public.sector_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  version integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT false,
  identity_template jsonb NOT NULL DEFAULT '{}',
  faqs jsonb NOT NULL DEFAULT '[]',
  policies jsonb NOT NULL DEFAULT '[]',
  services jsonb NOT NULL DEFAULT '[]',
  test_scenarios jsonb NOT NULL DEFAULT '[]',
  kpi_defaults jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sector_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read published packs" ON public.sector_packs
  FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage sector packs" ON public.sector_packs
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER sector_packs_updated
  BEFORE UPDATE ON public.sector_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- How-to manual pages for the tenant portal
CREATE TABLE public.kah_manual_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'getting_started',
  sector_slug text, -- nullable = applies to all sectors
  body_md text NOT NULL,
  sort_order integer NOT NULL DEFAULT 100,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kah_manual_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read published manual" ON public.kah_manual_pages
  FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage manual" ON public.kah_manual_pages
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER kah_manual_updated
  BEFORE UPDATE ON public.kah_manual_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Global provider health pings (admins only)
CREATE TABLE public.operator_provider_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'unknown', -- 'healthy','degraded','down','unknown'
  latency_ms integer,
  message text,
  checked_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.operator_provider_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read provider health" ON public.operator_provider_health
  FOR SELECT USING (true);
CREATE POLICY "Admins write provider health" ON public.operator_provider_health
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX idx_provider_health_provider_time ON public.operator_provider_health (provider, checked_at DESC);

CREATE INDEX idx_op_secrets_dep ON public.operator_secrets (deployment_id);
CREATE INDEX idx_op_webhooks_dep ON public.operator_webhooks (deployment_id);
CREATE INDEX idx_op_notif_dep ON public.operator_notification_rules (deployment_id);
CREATE INDEX idx_op_team_dep ON public.operator_team_members (deployment_id);
