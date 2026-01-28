-- 1. Create menus table for Menu & Footer Builder
CREATE TABLE public.menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL UNIQUE,
  items_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Anyone can view menus (public site needs this)
CREATE POLICY "Anyone can view menus"
ON public.menus FOR SELECT
USING (true);

-- Authenticated users can manage menus
CREATE POLICY "Authenticated users can manage menus"
ON public.menus FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 2. Create pages table for Static Pages Manager
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  seo_title text,
  seo_description text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Published pages are viewable by everyone
CREATE POLICY "Published pages are viewable by everyone"
ON public.pages FOR SELECT
USING (is_published = true);

-- Authenticated users can view all pages
CREATE POLICY "Authenticated users can view all pages"
ON public.pages FOR SELECT
USING (auth.role() = 'authenticated');

-- Authenticated users can manage pages
CREATE POLICY "Authenticated users can insert pages"
ON public.pages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update pages"
ON public.pages FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete pages"
ON public.pages FOR DELETE
USING (auth.role() = 'authenticated');

-- 3. Create authors table for Author Management
CREATE TABLE public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  avatar_url text,
  role text DEFAULT 'כותב',
  slug text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Anyone can view authors
CREATE POLICY "Anyone can view authors"
ON public.authors FOR SELECT
USING (true);

-- Authenticated users can manage authors
CREATE POLICY "Authenticated users can manage authors"
ON public.authors FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Add author_id to articles table
ALTER TABLE public.articles ADD COLUMN author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL;

-- Create index for author lookups
CREATE INDEX idx_articles_author_id ON public.articles(author_id);

-- 5. Add is_active column to existing redirects table
ALTER TABLE public.redirects ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- 6. Create triggers for updated_at
CREATE TRIGGER update_menus_updated_at
BEFORE UPDATE ON public.menus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_authors_updated_at
BEFORE UPDATE ON public.authors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Insert default menu locations
INSERT INTO public.menus (location, items_json) VALUES
('header', '[]'),
('footer_col_1', '[]'),
('footer_col_2', '[]'),
('footer_col_3', '[]')
ON CONFLICT (location) DO NOTHING;