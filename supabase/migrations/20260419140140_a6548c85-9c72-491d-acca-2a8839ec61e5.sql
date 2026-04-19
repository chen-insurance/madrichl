CREATE POLICY "Allow public insert on financial_tracks"
ON public.financial_tracks
FOR INSERT
TO anon
WITH CHECK (true);