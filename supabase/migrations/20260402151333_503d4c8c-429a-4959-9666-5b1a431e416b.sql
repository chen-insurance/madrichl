
-- Fix 1: Restrict media storage to admin only
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;

CREATE POLICY "Only admin can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND public.is_admin_user());

CREATE POLICY "Only admin can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND public.is_admin_user());

CREATE POLICY "Only admin can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND public.is_admin_user());

-- Fix 2: Create admin_users table and update is_admin_user function
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Seed current admin
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'bensagi981@gmail.com'
ON CONFLICT DO NOTHING;

-- RLS: only existing admins can view/manage admin_users
CREATE POLICY "Only admins can view admin_users"
ON public.admin_users FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Only admins can manage admin_users"
ON public.admin_users FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Update is_admin_user to use table instead of hardcoded email
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  )
$$;

-- Fix 3: Tighten article preview token policy
DROP POLICY IF EXISTS "Anyone can view articles with valid preview token" ON public.articles;
