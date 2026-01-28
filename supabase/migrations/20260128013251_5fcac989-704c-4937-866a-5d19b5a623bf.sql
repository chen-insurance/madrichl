-- Create analytics_events table for deep content tracking
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  value numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_analytics_events_article_id ON public.analytics_events(article_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics events (anonymous tracking)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view analytics
CREATE POLICY "Authenticated users can view analytics"
ON public.analytics_events
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create storage bucket for media library
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage policies for media bucket
CREATE POLICY "Anyone can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Add preview_token column to articles for shareable drafts
ALTER TABLE public.articles ADD COLUMN preview_token text UNIQUE;

-- Create function to generate preview tokens
CREATE OR REPLACE FUNCTION public.generate_preview_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token text;
BEGIN
  -- Generate a cryptographically random token
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$;

-- Allow public access to articles via preview token (bypass is_published check)
CREATE POLICY "Anyone can view articles with valid preview token"
ON public.articles
FOR SELECT
USING (preview_token IS NOT NULL AND preview_token != '');