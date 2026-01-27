-- Create financial_tracks table for comparison data
CREATE TABLE public.financial_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  ytd_return NUMERIC(6,2),
  last_year_return NUMERIC(6,2),
  management_fee NUMERIC(4,2),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_tracks ENABLE ROW LEVEL SECURITY;

-- Public can view tracks
CREATE POLICY "Anyone can view financial tracks"
ON public.financial_tracks
FOR SELECT
USING (true);

-- Authenticated users can manage tracks
CREATE POLICY "Authenticated users can insert tracks"
ON public.financial_tracks
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tracks"
ON public.financial_tracks
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tracks"
ON public.financial_tracks
FOR DELETE
TO authenticated
USING (true);

-- Create index for sorting
CREATE INDEX idx_financial_tracks_type ON public.financial_tracks(type);
CREATE INDEX idx_financial_tracks_provider ON public.financial_tracks(provider);

-- Insert sample data
INSERT INTO public.financial_tracks (name, provider, type, ytd_return, last_year_return, management_fee) VALUES
('S&P 500 מחקה', 'הראל', 'קרן השתלמות', 18.45, 24.32, 0.52),
('S&P 500 מחקה', 'מגדל', 'קרן השתלמות', 17.89, 23.87, 0.58),
('נאסד"ק 100', 'הראל', 'קרן השתלמות', 22.15, 31.45, 0.65),
('מניות ישראל', 'מנורה', 'גמל', 8.23, 12.56, 0.48),
('אג"ח ממשלתי', 'כלל', 'גמל', 3.45, 5.67, 0.35),
('מסלול כללי', 'הפניקס', 'פנסיה', 12.34, 15.78, 0.42);