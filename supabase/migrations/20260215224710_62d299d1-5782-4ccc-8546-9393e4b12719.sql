
-- Customer Reviews table
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  name text NOT NULL,
  role text NULL,
  company text NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  approved_at timestamptz NULL,
  approved_by uuid NULL,
  ip_hash text NULL,
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_approved_created_at
  ON public.customer_reviews (approved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_user_id_created_at
  ON public.customer_reviews (user_id, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at := now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_customer_reviews_updated_at ON public.customer_reviews;
CREATE TRIGGER trg_customer_reviews_updated_at
BEFORE UPDATE ON public.customer_reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Rate-limit helper
CREATE OR REPLACE FUNCTION public.can_submit_review(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.customer_reviews r
    WHERE r.user_id = p_user AND r.created_at > now() - interval '24 hours'
  );
$$;

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved reviews"
ON public.customer_reviews FOR SELECT TO anon, authenticated
USING (approved = true);

CREATE POLICY "Authenticated can submit review (rate limited)"
ON public.customer_reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (user_id IS NULL OR user_id = auth.uid())
  AND public.can_submit_review(auth.uid())
  AND approved = false
);

CREATE POLICY "Authenticated can read own reviews"
ON public.customer_reviews FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin can read all reviews"
ON public.customer_reviews FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can moderate reviews"
ON public.customer_reviews FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete reviews"
ON public.customer_reviews FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- Inbound Leads table
CREATE TABLE IF NOT EXISTS public.inbound_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  lead_type text NOT NULL CHECK (lead_type IN ('investor','agency_plus_plus','partnership','support','other')),
  name text NOT NULL,
  email text NOT NULL,
  company text NULL,
  message text NOT NULL,
  source_path text NULL,
  utm_source text NULL,
  utm_medium text NULL,
  utm_campaign text NULL,
  utm_term text NULL,
  utm_content text NULL,
  ip_hash text NULL,
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbound_leads_created_at
  ON public.inbound_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbound_leads_lead_type_created_at
  ON public.inbound_leads (lead_type, created_at DESC);

ALTER TABLE public.inbound_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit leads"
ON public.inbound_leads FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admin can read leads"
ON public.inbound_leads FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete leads"
ON public.inbound_leads FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));
