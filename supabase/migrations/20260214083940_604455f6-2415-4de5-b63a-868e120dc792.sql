-- Fix: restrict audit_log insert to admins only
DROP POLICY IF EXISTS "audit_log_insert_only" ON public.admin_audit_log;
CREATE POLICY "audit_log_insert_admins" ON public.admin_audit_log
FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));