-- Fix remaining overly permissive policies that were not part of the admin security update

-- Fix article_views INSERT policy (public can insert, that's intentional for tracking)
-- This is fine as-is since anyone should be able to record a view

-- Fix analytics_events INSERT policy (public can insert, that's intentional)
-- This is fine as-is since anyone should be able to record events

-- Fix leads INSERT policy (public can insert, that's intentional for lead capture)
-- This is fine as-is since anyone should be able to submit leads

-- The linter warnings are for intentional public INSERT policies
-- These are designed to allow anonymous users to submit data
-- No changes needed for these specific policies