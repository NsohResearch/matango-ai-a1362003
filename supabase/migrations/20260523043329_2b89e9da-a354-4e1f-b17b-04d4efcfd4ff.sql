
ALTER TABLE public.operator_deployments
  ADD COLUMN IF NOT EXISTS service_area_zips text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_area_center text,
  ADD COLUMN IF NOT EXISTS service_area_radius_miles integer;

CREATE TABLE IF NOT EXISTS public.operator_test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.operator_deployments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  scenario_id text NOT NULL,
  scenario_label text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  transcript text,
  notes text,
  score numeric,
  ran_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_test_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own test runs read" ON public.operator_test_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own test runs insert" ON public.operator_test_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own test runs update" ON public.operator_test_runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own test runs delete" ON public.operator_test_runs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_operator_test_runs_updated_at
  BEFORE UPDATE ON public.operator_test_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_test_runs_deployment ON public.operator_test_runs(deployment_id);
