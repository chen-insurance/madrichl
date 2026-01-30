-- Add birth_year and current_status columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS birth_year integer,
ADD COLUMN IF NOT EXISTS current_status text;