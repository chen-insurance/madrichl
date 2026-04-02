-- Fix: Restrict authenticated article SELECT to admin only
DROP POLICY IF EXISTS "Authenticated users can view all articles" ON public.articles;
CREATE POLICY "Only admin can view all articles"
ON public.articles FOR SELECT
TO authenticated
USING (public.is_admin_user() OR is_published = true);