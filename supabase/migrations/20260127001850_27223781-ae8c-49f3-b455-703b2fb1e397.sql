-- Add author and category fields for E-E-A-T and internal linking
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS author_name text DEFAULT 'מערכת המדריך',
ADD COLUMN IF NOT EXISTS author_bio text DEFAULT 'צוות המומחים של המדריך לצרכן מביא לכם מידע מקצועי ואובייקטיבי בתחום הביטוח והפיננסים.',
ADD COLUMN IF NOT EXISTS category text DEFAULT 'כללי';

-- Add index for category-based queries (related articles)
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);