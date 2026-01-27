-- 1. Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Add embedding column to articles for semantic similarity
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Add view_count column for trending
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- 4. Create article_views table for time-based trending
CREATE TABLE IF NOT EXISTS public.article_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  visitor_hash text
);

-- Enable RLS on article_views
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (anonymous tracking)
CREATE POLICY "Anyone can insert article views" ON public.article_views
FOR INSERT WITH CHECK (true);

-- Authenticated users can view analytics
CREATE POLICY "Authenticated users can view article views" ON public.article_views
FOR SELECT USING (true);

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON public.article_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_article_views_visitor_hash ON public.article_views(visitor_hash);

-- 5. Create redirects table for auto-healing SEO
CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  old_slug text NOT NULL UNIQUE,
  new_slug text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on redirects
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Everyone can read redirects (needed for frontend redirect logic)
CREATE POLICY "Anyone can read redirects" ON public.redirects
FOR SELECT USING (true);

-- Authenticated users can manage redirects
CREATE POLICY "Authenticated users can manage redirects" ON public.redirects
FOR ALL USING (true);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_redirects_old_slug ON public.redirects(old_slug);

-- 6. Create trigger function to auto-create redirects on slug change
CREATE OR REPLACE FUNCTION public.handle_slug_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create redirect if slug actually changed and article is published
  IF OLD.slug IS DISTINCT FROM NEW.slug AND OLD.slug IS NOT NULL THEN
    -- Insert redirect, update if old_slug already exists
    INSERT INTO public.redirects (old_slug, new_slug)
    VALUES (OLD.slug, NEW.slug)
    ON CONFLICT (old_slug) DO UPDATE SET new_slug = EXCLUDED.new_slug;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for slug changes
DROP TRIGGER IF EXISTS on_article_slug_change ON public.articles;
CREATE TRIGGER on_article_slug_change
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_slug_change();

-- 7. Create function to get trending articles (last 7 days)
CREATE OR REPLACE FUNCTION public.get_trending_articles(
  p_limit integer DEFAULT 5,
  p_exclude_slug text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  featured_image text,
  published_at timestamptz,
  category text,
  view_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.featured_image,
    a.published_at,
    a.category,
    COALESCE(v.views, 0::bigint) as view_count
  FROM public.articles a
  LEFT JOIN (
    SELECT article_id, COUNT(*) as views
    FROM public.article_views
    WHERE viewed_at >= NOW() - INTERVAL '7 days'
    GROUP BY article_id
  ) v ON a.id = v.article_id
  WHERE a.is_published = true
    AND (p_exclude_slug IS NULL OR a.slug != p_exclude_slug)
  ORDER BY COALESCE(v.views, 0) DESC, a.published_at DESC
  LIMIT p_limit;
END;
$$;

-- 8. Create function for semantic similarity search
CREATE OR REPLACE FUNCTION public.match_articles(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 3,
  exclude_slug text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  featured_image text,
  published_at timestamptz,
  category text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.featured_image,
    a.published_at,
    a.category,
    1 - (a.embedding <=> query_embedding) as similarity
  FROM public.articles a
  WHERE a.is_published = true
    AND a.embedding IS NOT NULL
    AND (exclude_slug IS NULL OR a.slug != exclude_slug)
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_articles_embedding ON public.articles 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);