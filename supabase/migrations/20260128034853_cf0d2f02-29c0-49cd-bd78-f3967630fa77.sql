-- Create a security definer function to check if user email is the admin email
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND email = 'bensagi981@gmail.com'
  )
$$;

-- Update articles policies for INSERT/UPDATE/DELETE to only allow admin email
DROP POLICY IF EXISTS "Authenticated users can create articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON public.articles;

CREATE POLICY "Only admin can create articles" 
ON public.articles 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admin can update articles" 
ON public.articles 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Only admin can delete articles" 
ON public.articles 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());

-- Update categories policies for ALL operations to only allow admin email
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

CREATE POLICY "Only admin can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Update site_settings policies for ALL operations to only allow admin email
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;

CREATE POLICY "Only admin can manage site settings" 
ON public.site_settings 
FOR ALL 
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Update menus policies
DROP POLICY IF EXISTS "Authenticated users can manage menus" ON public.menus;

CREATE POLICY "Only admin can manage menus" 
ON public.menus 
FOR ALL 
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Update pages policies
DROP POLICY IF EXISTS "Authenticated users can insert pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated users can update pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated users can delete pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated users can view all pages" ON public.pages;

CREATE POLICY "Only admin can insert pages" 
ON public.pages 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admin can update pages" 
ON public.pages 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Only admin can delete pages" 
ON public.pages 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can view all pages" 
ON public.pages 
FOR SELECT 
TO authenticated
USING (public.is_admin_user());

-- Update authors policies
DROP POLICY IF EXISTS "Authenticated users can manage authors" ON public.authors;

CREATE POLICY "Only admin can manage authors" 
ON public.authors 
FOR ALL 
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Update redirects policies
DROP POLICY IF EXISTS "Authenticated users can manage redirects" ON public.redirects;

CREATE POLICY "Only admin can manage redirects" 
ON public.redirects 
FOR ALL 
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Update financial_tracks policies
DROP POLICY IF EXISTS "Authenticated users can insert tracks" ON public.financial_tracks;
DROP POLICY IF EXISTS "Authenticated users can update tracks" ON public.financial_tracks;
DROP POLICY IF EXISTS "Authenticated users can delete tracks" ON public.financial_tracks;

CREATE POLICY "Only admin can insert tracks" 
ON public.financial_tracks 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admin can update tracks" 
ON public.financial_tracks 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Only admin can delete tracks" 
ON public.financial_tracks 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());

-- Update leads policies (admin can view/delete)
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;

CREATE POLICY "Only admin can view leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Only admin can delete leads" 
ON public.leads 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());

-- Update analytics_events policies
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON public.analytics_events;

CREATE POLICY "Only admin can view analytics" 
ON public.analytics_events 
FOR SELECT 
TO authenticated
USING (public.is_admin_user());