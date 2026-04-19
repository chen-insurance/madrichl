DROP POLICY IF EXISTS "Allow public read on financial_tracks" ON public.financial_tracks;
CREATE POLICY "Allow public read on financial_tracks"
ON public.financial_tracks
FOR SELECT
TO anon
USING (true);