
-- 1. Fix profiles role self-escalation: restrict role column updates and switch is_admin to user_roles

-- Backfill user_roles from profiles.role for any existing admins
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role FROM public.profiles
WHERE role IN ('admin', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Replace is_admin to use user_roles
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role IN ('admin', 'super_admin')
  )
$$;

-- Restrict profile updates so users cannot change their role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 2. training-images: drop overly broad SELECT policy
DROP POLICY IF EXISTS "Anyone can read training images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload training images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own training images" ON storage.objects;

-- 3. brand-assets: scope update/delete by folder owner
DROP POLICY IF EXISTS "Users can update own brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own brand assets" ON storage.objects;

CREATE POLICY "Users can update own brand assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'brand-assets'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own brand assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'brand-assets'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. content_templates: restrict public read to system templates only
DROP POLICY IF EXISTS "Anyone can view templates" ON public.content_templates;
CREATE POLICY "Anyone can view system templates"
ON public.content_templates
FOR SELECT
USING (user_id IS NULL OR is_custom = false);

-- 5. kah_messages: remove anon read of all anonymous messages
DROP POLICY IF EXISTS "Anon read own session" ON public.kah_messages;
