
-- Credit ledger: transparent audit trail of all credit changes
CREATE TABLE public.credit_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  delta integer NOT NULL, -- positive = grant, negative = deduction
  reason text NOT NULL, -- e.g. 'admin_grant', 'admin_deduct', 'usage', 'monthly_reset', 'voucher'
  note text, -- human-readable note from admin
  admin_id uuid, -- who performed the action (null for system)
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- Users can view their own ledger
CREATE POLICY "Users view own credit ledger"
  ON public.credit_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all ledger entries
CREATE POLICY "Admins view all credit ledger"
  ON public.credit_ledger FOR SELECT
  USING (is_admin(auth.uid()));

-- Only service role / edge functions insert (via admin edge function)
-- No direct insert by regular users
CREATE POLICY "Admins insert credit ledger"
  ON public.credit_ledger FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- No updates or deletes (immutable ledger)
CREATE POLICY "No update credit ledger"
  ON public.credit_ledger FOR UPDATE
  USING (false);

CREATE POLICY "No delete credit ledger"
  ON public.credit_ledger FOR DELETE
  USING (false);

-- Index for fast user lookups
CREATE INDEX idx_credit_ledger_user_id ON public.credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_created_at ON public.credit_ledger(created_at DESC);
