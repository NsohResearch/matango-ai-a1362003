
-- ============================================
-- MATANGO.AI — FULL DATABASE SCHEMA MIGRATION
-- ============================================

-- ===================
-- TIMESTAMP UPDATER
-- ===================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===================
-- 1. CORE TABLES
-- ===================

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user',
  plan text NOT NULL DEFAULT 'free',
  credits integer NOT NULL DEFAULT 20,
  onboarding_completed boolean NOT NULL DEFAULT false,
  account_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  assets_limit integer NOT NULL DEFAULT 20,
  max_brands integer NOT NULL DEFAULT 1,
  active_brand_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ===================
-- HELPER FUNCTIONS (after tables exist)
-- ===================

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = p_user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(p_user_id uuid, p_org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = p_user_id AND organization_id = p_org_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = p_user_id AND role IN ('admin', 'super_admin')
  );
$$;

-- ===================
-- 2. BRAND BRAIN
-- ===================

CREATE TABLE public.business_dna (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  brand_name text,
  product_name text,
  website_url text,
  category text,
  tagline text,
  brand_tone text DEFAULT 'professional',
  icp_personas jsonb DEFAULT '[]'::jsonb,
  key_outcomes jsonb DEFAULT '[]'::jsonb,
  differentiators jsonb DEFAULT '[]'::jsonb,
  claims_proof jsonb DEFAULT '[]'::jsonb,
  voice_rules jsonb DEFAULT '[]'::jsonb,
  forbidden_phrases text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 3. AI INFLUENCERS
-- ===================

CREATE TABLE public.influencers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.business_dna(id) ON DELETE SET NULL,
  name text NOT NULL,
  age integer,
  bio text,
  personality text,
  persona_type text DEFAULT 'custom',
  avatar_url text,
  tags text[] DEFAULT '{}',
  stats jsonb DEFAULT '{"followers":0,"likes":0,"views":0}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.influencer_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  image_url text,
  prompt text,
  content_type text DEFAULT 'image',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.influencer_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id uuid NOT NULL UNIQUE REFERENCES public.influencers(id) ON DELETE CASCADE,
  character_weight integer DEFAULT 50,
  keep_outfit boolean DEFAULT false,
  keep_face boolean DEFAULT true,
  keep_hair boolean DEFAULT false,
  default_style text DEFAULT 'realistic',
  camera_framing text DEFAULT 'chest-up',
  camera_angle text DEFAULT 'front',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.influencer_personas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  persona_type text NOT NULL DEFAULT 'custom',
  style_guide text,
  vocabulary text,
  hook_patterns text[] DEFAULT '{}',
  cta_patterns text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.system_influencers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  persona_description text,
  camera_rules text,
  behavioral_constraints text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 4. CAMPAIGNS
-- ===================

CREATE TABLE public.unified_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.business_dna(id) ON DELETE SET NULL,
  name text NOT NULL,
  angle text,
  rationale text,
  target_icp text,
  status text NOT NULL DEFAULT 'draft',
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  leads_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.unified_campaigns(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  platform text,
  content text,
  status text NOT NULL DEFAULT 'draft',
  utm_tracking jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  influencer_id uuid REFERENCES public.influencers(id) ON DELETE SET NULL,
  title text,
  total_scenes integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_scenes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  scene_number integer NOT NULL DEFAULT 1,
  prompt text,
  caption text,
  image_url text,
  scheduled_for timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 5. SOCIAL & PUBLISHING
-- ===================

CREATE TABLE public.social_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  platform text NOT NULL,
  access_token_encrypted text,
  refresh_token_encrypted text,
  platform_username text,
  platform_user_id text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.social_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.social_connections(id) ON DELETE SET NULL,
  platform_post_id text,
  content text,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  metrics jsonb DEFAULT '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scheduled_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  influencer_id uuid REFERENCES public.influencers(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.unified_campaigns(id) ON DELETE SET NULL,
  platform text NOT NULL,
  content text,
  image_url text,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 6. ANALYTICS
-- ===================

CREATE TABLE public.analytics_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id uuid REFERENCES public.influencers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  followers integer DEFAULT 0,
  likes integer DEFAULT 0,
  views integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  engagement_rate numeric(5,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  source text,
  platform text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.auto_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text,
  confidence numeric(3,2) DEFAULT 0.5,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 7. A/B TESTING
-- ===================

CREATE TABLE public.ab_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.unified_campaigns(id) ON DELETE SET NULL,
  test_type text NOT NULL DEFAULT 'caption',
  status text NOT NULL DEFAULT 'draft',
  target_metric text DEFAULT 'engagement',
  confidence_level integer DEFAULT 95,
  min_sample_size integer DEFAULT 100,
  auto_optimize boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ab_test_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id uuid NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text,
  traffic_split integer DEFAULT 50,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  is_winner boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 8. CRM & LEADS
-- ===================

CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.business_dna(id) ON DELETE SET NULL,
  email text,
  name text,
  company text,
  role text,
  source text,
  stage text NOT NULL DEFAULT 'new',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.landing_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.unified_campaigns(id) ON DELETE SET NULL,
  headline text,
  slug text UNIQUE,
  views integer DEFAULT 0,
  conversions integer DEFAULT 0,
  content jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_sequences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.unified_campaigns(id) ON DELETE SET NULL,
  name text,
  sequence_type text DEFAULT 'welcome',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_sequence_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id uuid NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  step_number integer NOT NULL DEFAULT 1,
  subject text,
  body text,
  delay_days integer DEFAULT 0,
  sent integer DEFAULT 0,
  opened integer DEFAULT 0,
  clicked integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 9. AGENCY / WHITE-LABEL
-- ===================

CREATE TABLE public.white_label_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  brand_name text,
  logo_url text,
  favicon_url text,
  primary_color text,
  secondary_color text,
  accent_color text,
  custom_domain text,
  hide_branding boolean DEFAULT false,
  custom_footer text,
  support_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.custom_email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_type text NOT NULL,
  subject text,
  html_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.client_workspaces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  access_token text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 10. VIDEO & SCRIPTS
-- ===================

CREATE TABLE public.video_scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  script_type text DEFAULT 'custom',
  scenes jsonb DEFAULT '[]'::jsonb,
  delivery_notes text,
  duration integer,
  platform text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.video_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  influencer_id uuid REFERENCES public.influencers(id) ON DELETE SET NULL,
  script_id uuid REFERENCES public.video_scripts(id) ON DELETE SET NULL,
  job_type text DEFAULT 'text-to-video',
  status text NOT NULL DEFAULT 'queued',
  progress integer DEFAULT 0,
  input_refs jsonb DEFAULT '{}'::jsonb,
  output_url text,
  lip_sync boolean DEFAULT false,
  provider text DEFAULT 'builtin',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.video_scenes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_job_id uuid NOT NULL REFERENCES public.video_jobs(id) ON DELETE CASCADE,
  scene_number integer NOT NULL DEFAULT 1,
  prompt text,
  duration integer DEFAULT 5,
  aspect_ratio text DEFAULT '16:9',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 11. ASSET MANAGEMENT
-- ===================

CREATE TABLE public.asset_library (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.business_dna(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'image',
  url text,
  prompt text,
  model text,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  parent_id uuid REFERENCES public.asset_library(id) ON DELETE SET NULL,
  version integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.asset_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid NOT NULL REFERENCES public.asset_library(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  url text,
  edit_op text,
  prompt text,
  model text,
  diff jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.edit_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid NOT NULL REFERENCES public.asset_library(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 12. NOTIFICATIONS & COLLABORATION
-- ===================

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'pending',
  invite_token text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 13. CONTENT TEMPLATES
-- ===================

CREATE TABLE public.content_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text DEFAULT 'custom',
  prompt_template text,
  style_preset text,
  character_weight integer DEFAULT 50,
  usage_count integer DEFAULT 0,
  is_custom boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 14. ADMIN
-- ===================

CREATE TABLE public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_enabled boolean NOT NULL DEFAULT false,
  rules jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- 15. K'AH CHAT
-- ===================

CREATE TABLE public.kah_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.kah_qa_corpus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_pattern text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================
-- ENABLE RLS ON ALL TABLES
-- ===================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kah_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kah_qa_corpus ENABLE ROW LEVEL SECURITY;

-- ===================
-- RLS POLICIES
-- ===================

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

-- ORGANIZATIONS
CREATE POLICY "Owners can manage orgs" ON public.organizations FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members can view orgs" ON public.organizations FOR SELECT USING (public.is_org_member(auth.uid(), id));

-- MEMBERSHIPS
CREATE POLICY "Users can view own memberships" ON public.memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Org owners can manage memberships" ON public.memberships FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- USER-SCOPED (user can CRUD own data)
CREATE POLICY "Users manage own brand brain" ON public.business_dna FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own influencers" ON public.influencers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage influencer content" ON public.influencer_content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage influencer settings" ON public.influencer_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage influencer personas" ON public.influencer_personas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
);

-- system_influencers: public read
CREATE POLICY "Anyone can view system influencers" ON public.system_influencers FOR SELECT USING (true);
CREATE POLICY "Admins manage system influencers" ON public.system_influencers FOR ALL USING (public.is_admin(auth.uid()));

-- campaigns
CREATE POLICY "Users manage own unified campaigns" ON public.unified_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage campaign assets" ON public.campaign_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.unified_campaigns WHERE id = campaign_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own legacy campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage campaign scenes" ON public.campaign_scenes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND user_id = auth.uid())
);

-- social
CREATE POLICY "Users manage own social connections" ON public.social_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own social posts" ON public.social_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own scheduled posts" ON public.scheduled_posts FOR ALL USING (auth.uid() = user_id);

-- analytics
CREATE POLICY "Users manage own analytics" ON public.analytics_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own events" ON public.analytics_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own insights" ON public.auto_insights FOR SELECT USING (auth.uid() = user_id);

-- ab tests
CREATE POLICY "Users manage own ab tests" ON public.ab_tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage ab test variants" ON public.ab_test_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM public.ab_tests WHERE id = test_id AND user_id = auth.uid())
);

-- leads
CREATE POLICY "Users manage own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own landing pages" ON public.landing_pages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own email sequences" ON public.email_sequences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage email steps" ON public.email_sequence_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.email_sequences WHERE id = sequence_id AND user_id = auth.uid())
);

-- agency
CREATE POLICY "Org members view white label" ON public.white_label_settings FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org owners manage white label" ON public.white_label_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND owner_id = auth.uid())
);
CREATE POLICY "Org members view email templates" ON public.custom_email_templates FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org owners manage email templates" ON public.custom_email_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND owner_id = auth.uid())
);
CREATE POLICY "Org owners manage workspaces" ON public.client_workspaces FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND owner_id = auth.uid())
);

-- video
CREATE POLICY "Users manage own scripts" ON public.video_scripts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own video jobs" ON public.video_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage video scenes" ON public.video_scenes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.video_jobs WHERE id = video_job_id AND user_id = auth.uid())
);

-- assets
CREATE POLICY "Users manage own assets" ON public.asset_library FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage asset versions" ON public.asset_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.asset_library WHERE id = asset_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own edit sessions" ON public.edit_sessions FOR ALL USING (auth.uid() = user_id);

-- notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- collaborators
CREATE POLICY "Users view own influencer collaborators" ON public.collaborators FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own influencer collaborators" ON public.collaborators FOR ALL USING (
  EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
);

-- templates: public read, user manage own
CREATE POLICY "Anyone can view templates" ON public.content_templates FOR SELECT USING (true);
CREATE POLICY "Users manage own custom templates" ON public.content_templates FOR ALL USING (auth.uid() = user_id);

-- admin
CREATE POLICY "Admins view audit log" ON public.admin_audit_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins insert audit log" ON public.admin_audit_log FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Anyone read feature flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins manage feature flags" ON public.feature_flags FOR ALL USING (public.is_admin(auth.uid()));

-- kah
CREATE POLICY "Users manage own kah messages" ON public.kah_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anon insert kah messages" ON public.kah_messages FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "Anon read own session" ON public.kah_messages FOR SELECT USING (user_id IS NULL);
CREATE POLICY "Anyone read kah corpus" ON public.kah_qa_corpus FOR SELECT USING (true);
CREATE POLICY "Admins manage kah corpus" ON public.kah_qa_corpus FOR ALL USING (public.is_admin(auth.uid()));

-- ===================
-- INDEXES
-- ===================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_memberships_org ON public.memberships(organization_id);
CREATE INDEX idx_memberships_user ON public.memberships(user_id);
CREATE INDEX idx_business_dna_user ON public.business_dna(user_id);
CREATE INDEX idx_business_dna_org ON public.business_dna(org_id);
CREATE INDEX idx_influencers_user ON public.influencers(user_id);
CREATE INDEX idx_influencer_content_inf ON public.influencer_content(influencer_id);
CREATE INDEX idx_unified_campaigns_user ON public.unified_campaigns(user_id);
CREATE INDEX idx_unified_campaigns_status ON public.unified_campaigns(status);
CREATE INDEX idx_campaign_assets_campaign ON public.campaign_assets(campaign_id);
CREATE INDEX idx_social_connections_user ON public.social_connections(user_id);
CREATE INDEX idx_scheduled_posts_user ON public.scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_when ON public.scheduled_posts(scheduled_for);
CREATE INDEX idx_analytics_data_user ON public.analytics_data(user_id);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_time ON public.analytics_events(created_at);
CREATE INDEX idx_leads_user ON public.leads(user_id);
CREATE INDEX idx_leads_stage ON public.leads(stage);
CREATE INDEX idx_video_jobs_user ON public.video_jobs(user_id);
CREATE INDEX idx_video_jobs_status ON public.video_jobs(status);
CREATE INDEX idx_asset_library_user ON public.asset_library(user_id);
CREATE INDEX idx_asset_library_type ON public.asset_library(type);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_kah_messages_session ON public.kah_messages(session_id);

-- ===================
-- TRIGGERS
-- ===================

CREATE TRIGGER update_profiles_ts BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_ts BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_dna_ts BEFORE UPDATE ON public.business_dna FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_influencers_ts BEFORE UPDATE ON public.influencers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_influencer_settings_ts BEFORE UPDATE ON public.influencer_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_unified_campaigns_ts BEFORE UPDATE ON public.unified_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_ts BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_social_connections_ts BEFORE UPDATE ON public.social_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ab_tests_ts BEFORE UPDATE ON public.ab_tests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_ts BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_white_label_ts BEFORE UPDATE ON public.white_label_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_video_scripts_ts BEFORE UPDATE ON public.video_scripts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_video_jobs_ts BEFORE UPDATE ON public.video_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_asset_library_ts BEFORE UPDATE ON public.asset_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_edit_sessions_ts BEFORE UPDATE ON public.edit_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_flags_ts BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ===================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
