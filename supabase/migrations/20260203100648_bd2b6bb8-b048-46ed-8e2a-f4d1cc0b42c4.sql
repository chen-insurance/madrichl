-- Create article_categories junction table for many-to-many relationship
CREATE TABLE public.article_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, category_id)
);

-- Enable RLS
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view article-category relationships
CREATE POLICY "Anyone can view article categories"
ON public.article_categories
FOR SELECT
USING (true);

-- Only admin can manage article-category relationships
CREATE POLICY "Only admin can manage article categories"
ON public.article_categories
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create index for faster lookups
CREATE INDEX idx_article_categories_article_id ON public.article_categories(article_id);
CREATE INDEX idx_article_categories_category_id ON public.article_categories(category_id);

-- Add is_featured column to articles for featured article on homepage
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;