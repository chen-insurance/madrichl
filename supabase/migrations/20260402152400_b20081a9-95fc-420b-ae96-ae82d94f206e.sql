-- Fix article_views SELECT policy: restrict to admin only instead of public true
DROP POLICY IF EXISTS "Authenticated users can view article views" ON public.article_views;

CREATE POLICY "Only admin can view article views"
ON public.article_views FOR SELECT
TO authenticated
USING (public.is_admin_user());