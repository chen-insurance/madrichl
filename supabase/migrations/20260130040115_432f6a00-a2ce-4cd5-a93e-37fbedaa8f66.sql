-- Create glossary_terms table
CREATE TABLE public.glossary_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  definition_rich_text TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Anyone can view glossary terms (public SEO content)
CREATE POLICY "Anyone can view glossary terms"
ON public.glossary_terms
FOR SELECT
USING (true);

-- Only admin can manage glossary terms
CREATE POLICY "Only admin can manage glossary terms"
ON public.glossary_terms
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Add updated_at trigger
CREATE TRIGGER update_glossary_terms_updated_at
BEFORE UPDATE ON public.glossary_terms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();