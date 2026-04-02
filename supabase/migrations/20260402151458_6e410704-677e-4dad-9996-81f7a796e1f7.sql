
CREATE OR REPLACE FUNCTION public.get_article_by_preview_token(p_token text)
RETURNS SETOF public.articles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.articles
  WHERE preview_token = p_token
    AND preview_token IS NOT NULL
    AND preview_token <> ''
  LIMIT 1;
$$;
