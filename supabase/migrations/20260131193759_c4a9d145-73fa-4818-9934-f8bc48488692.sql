-- Add image_alt_text column to articles table for SEO
ALTER TABLE public.articles 
ADD COLUMN image_alt_text text;

-- Add a comment for documentation
COMMENT ON COLUMN public.articles.image_alt_text IS 'Alt text for the featured image, used for SEO and accessibility';