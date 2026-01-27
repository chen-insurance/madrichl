-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can view categories
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Authenticated users can manage categories
CREATE POLICY "Authenticated users can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add category_id to articles (nullable for backwards compatibility)
ALTER TABLE public.articles 
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_articles_category_id ON public.articles(category_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- Add trigger for updated_at on categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories based on existing category values
INSERT INTO public.categories (name, slug, description) VALUES
  ('ביטוח רכב', 'car-insurance', 'מאמרים בנושא ביטוח רכב וחובה'),
  ('ביטוח בריאות', 'health-insurance', 'מאמרים בנושא ביטוח בריאות ומשלים'),
  ('ביטוח חיים', 'life-insurance', 'מאמרים בנושא ביטוח חיים וריסק'),
  ('פנסיה', 'pension', 'מאמרים בנושא פנסיה וחיסכון'),
  ('כללי', 'general', 'מאמרים כלליים בתחום הביטוח והפיננסים');