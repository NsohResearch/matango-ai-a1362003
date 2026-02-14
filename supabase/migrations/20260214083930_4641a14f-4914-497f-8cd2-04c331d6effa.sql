-- Make admin_audit_log append-only: deny UPDATE and DELETE for all users
CREATE POLICY "audit_log_insert_only" ON public.admin_audit_log
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "audit_log_select_admins" ON public.admin_audit_log
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "audit_log_no_update" ON public.admin_audit_log
FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "audit_log_no_delete" ON public.admin_audit_log
FOR DELETE TO authenticated
USING (false);

-- Make usage_events append-only: users can insert their own, no update/delete
CREATE POLICY "usage_events_insert_own" ON public.usage_events
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_events_select_own" ON public.usage_events
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "usage_events_no_update" ON public.usage_events
FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "usage_events_no_delete" ON public.usage_events
FOR DELETE TO authenticated
USING (false);