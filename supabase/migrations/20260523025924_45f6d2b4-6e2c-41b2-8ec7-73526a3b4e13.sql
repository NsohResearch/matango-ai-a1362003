-- Ka'h Receptionist platform schema (operator-agnostic, scoped to org + operator_slug)

CREATE TABLE public.operator_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  operator_slug text NOT NULL,          -- 'kah','zuri','imani','bashir','kito','sefu'
  industry_slug text NOT NULL,          -- 'roofers','hvac','solar', etc.
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'onboarding',  -- onboarding | live | paused
  phone_number text,
  voice_id text,
  language_primary text NOT NULL DEFAULT 'en',
  language_secondary text,
  business_hours jsonb NOT NULL DEFAULT '{"timezone":"America/New_York","weekdays":{"start":"08:00","end":"18:00"},"saturday":null,"sunday":null}'::jsonb,
  service_area_geojson jsonb,
  routing_matrix jsonb NOT NULL DEFAULT '[]'::jsonb,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  onboarding_progress jsonb NOT NULL DEFAULT '{"phase":1,"completed_steps":[]}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, operator_slug, industry_slug)
);

CREATE TABLE public.operator_knowledge_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  category text NOT NULL,               -- identity|services_pricing|service_area|insurance|materials|warranties|faqs|policies|team|other
  title text NOT NULL,
  content text,                         -- inline markdown
  media_object_id uuid,                 -- or pointer to uploaded file
  source_url text,
  refresh_cadence text DEFAULT 'manual',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_okd_deployment ON public.operator_knowledge_docs(deployment_id, category);

CREATE TABLE public.operator_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  tool_name text NOT NULL,              -- book_inspection, create_lead, etc.
  provider text NOT NULL,               -- google_calendar, jobnimbus, twilio, eagleview...
  is_enabled boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,   -- non-secret config (calendar id, base url)
  secret_ref text,                      -- reference to secret name in vault
  health_status text NOT NULL DEFAULT 'unknown',  -- ok | error | unknown
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deployment_id, tool_name)
);

CREATE TABLE public.operator_call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  call_sid text,
  direction text NOT NULL DEFAULT 'inbound',
  channel text NOT NULL DEFAULT 'voice', -- voice|sms|chat
  caller_number text,
  caller_name text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  disposition text,                       -- booked|transferred|voicemail|spam|emergency|nurture
  lead_type text,                         -- storm|retail|warranty|service|other
  qualification_score integer,
  in_service_area boolean,
  is_emergency boolean DEFAULT false,
  insurance_claim boolean,
  transcript text,
  recording_url text,
  summary text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_ocl_deployment_time ON public.operator_call_logs(deployment_id, started_at DESC);

CREATE TABLE public.operator_kpi_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  date date NOT NULL,
  calls_total integer NOT NULL DEFAULT 0,
  calls_answered integer NOT NULL DEFAULT 0,
  calls_qualified integer NOT NULL DEFAULT 0,
  calls_booked integer NOT NULL DEFAULT 0,
  calls_transferred integer NOT NULL DEFAULT 0,
  calls_emergency integer NOT NULL DEFAULT 0,
  after_hours_captured integer NOT NULL DEFAULT 0,
  missed_call_recovered integer NOT NULL DEFAULT 0,
  avg_handle_seconds integer NOT NULL DEFAULT 0,
  csat_avg numeric,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deployment_id, date)
);

-- RLS
ALTER TABLE public.operator_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_kpi_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own deployments" ON public.operator_deployments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Org members view deployments" ON public.operator_deployments
  FOR SELECT USING (is_org_member(auth.uid(), org_id));

CREATE POLICY "Users manage own knowledge" ON public.operator_knowledge_docs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own tools" ON public.operator_tools
  FOR ALL USING (EXISTS (SELECT 1 FROM operator_deployments d WHERE d.id = deployment_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM operator_deployments d WHERE d.id = deployment_id AND d.user_id = auth.uid()));

CREATE POLICY "Users view own call logs" ON public.operator_call_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service inserts call logs" ON public.operator_call_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own call logs" ON public.operator_call_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users view own kpis" ON public.operator_kpi_daily
  FOR SELECT USING (EXISTS (SELECT 1 FROM operator_deployments d WHERE d.id = deployment_id AND d.user_id = auth.uid()));
CREATE POLICY "Users upsert own kpis" ON public.operator_kpi_daily
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM operator_deployments d WHERE d.id = deployment_id AND d.user_id = auth.uid()));
CREATE POLICY "Users modify own kpis" ON public.operator_kpi_daily
  FOR UPDATE USING (EXISTS (SELECT 1 FROM operator_deployments d WHERE d.id = deployment_id AND d.user_id = auth.uid()));

CREATE TRIGGER trg_od_updated_at BEFORE UPDATE ON public.operator_deployments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_okd_updated_at BEFORE UPDATE ON public.operator_knowledge_docs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ot_updated_at BEFORE UPDATE ON public.operator_tools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();