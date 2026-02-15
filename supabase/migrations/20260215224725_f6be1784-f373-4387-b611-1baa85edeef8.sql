
-- Fix search_path on new functions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  new.updated_at := now();
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_submit_review(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.customer_reviews r
    WHERE r.user_id = p_user AND r.created_at > now() - interval '24 hours'
  );
$$;
