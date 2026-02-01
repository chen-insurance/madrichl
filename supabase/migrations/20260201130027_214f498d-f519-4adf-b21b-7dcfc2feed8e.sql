-- Fix RLS policies for site_settings table
-- Remove the public SELECT policy and only allow admin access

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;

-- Create a new policy that only allows admin to view site settings
CREATE POLICY "Only admin can view site settings"
ON public.site_settings
FOR SELECT
USING (is_admin_user());

-- Note: The existing "Only admin can manage site settings" policy 
-- already covers INSERT/UPDATE/DELETE with is_admin_user() check