
-- Usage tracking table for credit consumption
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'ai_generation', 'video_job', 'image_generation', 'aao_execution'
  credits_used INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.usage_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.usage_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_usage_events_user_date ON public.usage_events (user_id, created_at DESC);

-- GDPR requests table
CREATE TABLE public.gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  admin_id UUID,
  notes TEXT,
  result_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own GDPR requests" ON public.gdpr_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can create own GDPR requests" ON public.gdpr_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update GDPR requests" ON public.gdpr_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Function to get user credits remaining (plan limit - usage this month)
CREATE OR REPLACE FUNCTION public.get_credits_remaining(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 
    COALESCE((SELECT credits FROM profiles WHERE user_id = p_user_id), 0) - 
    COALESCE((SELECT SUM(credits_used) FROM usage_events WHERE user_id = p_user_id AND created_at >= date_trunc('month', now())), 0)
  )::INTEGER
$$;

-- Trigger to deduct credits on usage event
CREATE OR REPLACE FUNCTION public.track_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Record analytics event for the usage
  INSERT INTO analytics_events (user_id, event_type, metadata)
  VALUES (NEW.user_id, 'usage_' || NEW.event_type, NEW.metadata);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_usage_event
AFTER INSERT ON public.usage_events
FOR EACH ROW
EXECUTE FUNCTION public.track_usage();
