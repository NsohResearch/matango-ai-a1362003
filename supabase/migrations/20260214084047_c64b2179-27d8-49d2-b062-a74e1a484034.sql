-- Fix audit_log insert: ensure admin_id matches auth.uid()
DROP POLICY IF EXISTS "audit_log_insert_admins" ON public.admin_audit_log;
CREATE POLICY "audit_log_insert_admins" ON public.admin_audit_log
FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) AND admin_id = auth.uid());

-- Tighten profiles: hide email from non-self, non-admin
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Tighten social_connections: only own connections
DROP POLICY IF EXISTS "social_connections_select" ON public.social_connections;
CREATE POLICY "social_connections_select_own" ON public.social_connections
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "social_connections_insert" ON public.social_connections;
CREATE POLICY "social_connections_insert_own" ON public.social_connections
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "social_connections_update" ON public.social_connections;
CREATE POLICY "social_connections_update_own" ON public.social_connections
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "social_connections_delete" ON public.social_connections;
CREATE POLICY "social_connections_delete_own" ON public.social_connections
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Tighten leads: ensure strict user_id enforcement
DROP POLICY IF EXISTS "leads_select" ON public.leads;
CREATE POLICY "leads_select_own" ON public.leads
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "leads_insert" ON public.leads;
CREATE POLICY "leads_insert_own" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "leads_update" ON public.leads;
CREATE POLICY "leads_update_own" ON public.leads
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "leads_delete" ON public.leads;
CREATE POLICY "leads_delete_own" ON public.leads
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Tighten collaborators: hide invite_token from non-owners
DROP POLICY IF EXISTS "collaborators_select" ON public.collaborators;
CREATE POLICY "collaborators_select" ON public.collaborators
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.influencers
    WHERE influencers.id = collaborators.influencer_id
    AND influencers.user_id = auth.uid()
  )
);

-- Admin can audit usage_events
CREATE POLICY "usage_events_admin_select" ON public.usage_events
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));