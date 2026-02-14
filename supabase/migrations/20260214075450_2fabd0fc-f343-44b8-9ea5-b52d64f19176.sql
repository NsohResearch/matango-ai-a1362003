
-- Fix: Create training-images bucket if missing and add storage policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-images', 'training-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to training-images
CREATE POLICY "Authenticated users can upload training images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'training-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to read training images
CREATE POLICY "Anyone can read training images"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-images');

-- Allow users to delete their own training images
CREATE POLICY "Users can delete own training images"
ON storage.objects FOR DELETE
USING (bucket_id = 'training-images' AND auth.uid() IS NOT NULL);

-- Create video_outputs table for render tracking
CREATE TABLE public.video_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID REFERENCES public.organizations(id),
  brand_id UUID REFERENCES public.business_dna(id),
  video_job_id UUID REFERENCES public.video_jobs(id),
  format_preset TEXT NOT NULL DEFAULT 'VERTICAL_9_16',
  aspect_ratio TEXT NOT NULL DEFAULT '9:16',
  width INTEGER NOT NULL DEFAULT 1080,
  height INTEGER NOT NULL DEFAULT 1920,
  quality TEXT NOT NULL DEFAULT '720P',
  is_preview BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'queued',
  output_url TEXT,
  thumb_url TEXT,
  credit_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_outputs ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users manage own video outputs"
ON public.video_outputs FOR ALL
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_video_outputs_job ON public.video_outputs (video_job_id, is_preview);
CREATE INDEX idx_video_outputs_user ON public.video_outputs (user_id, created_at DESC);
