-- Create CTA Blocks table for reusable marketing blocks
CREATE TABLE public.cta_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  shortcut_code TEXT NOT NULL UNIQUE,
  headline TEXT,
  description TEXT,
  button_text TEXT,
  button_link TEXT,
  background_color TEXT DEFAULT '#f59e0b',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add FAQ items column to articles table
ALTER TABLE public.articles 
ADD COLUMN faq_items JSONB DEFAULT '[]'::jsonb;

-- Enable RLS on cta_blocks
ALTER TABLE public.cta_blocks ENABLE ROW LEVEL SECURITY;

-- Anyone can view active CTA blocks (needed for frontend rendering)
CREATE POLICY "Anyone can view active CTA blocks"
ON public.cta_blocks
FOR SELECT
USING (is_active = true);

-- Admin can view all CTA blocks
CREATE POLICY "Admin can view all CTA blocks"
ON public.cta_blocks
FOR SELECT
USING (is_admin_user());

-- Only admin can manage CTA blocks
CREATE POLICY "Only admin can manage CTA blocks"
ON public.cta_blocks
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create trigger for updated_at
CREATE TRIGGER update_cta_blocks_updated_at
BEFORE UPDATE ON public.cta_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for shortcut_code lookups
CREATE INDEX idx_cta_blocks_shortcut_code ON public.cta_blocks(shortcut_code);