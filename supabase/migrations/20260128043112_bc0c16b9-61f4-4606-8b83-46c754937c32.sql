-- Create life insurance rates table
CREATE TABLE public.life_insurance_rates (
  age integer PRIMARY KEY,
  price_per_100k_male_smoker numeric NOT NULL DEFAULT 0,
  price_per_100k_male_nonsmoker numeric NOT NULL DEFAULT 0,
  price_per_100k_female_smoker numeric NOT NULL DEFAULT 0,
  price_per_100k_female_nonsmoker numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.life_insurance_rates ENABLE ROW LEVEL SECURITY;

-- Anyone can view rates (for calculator)
CREATE POLICY "Anyone can view rates"
ON public.life_insurance_rates
FOR SELECT
USING (true);

-- Only admin can manage rates
CREATE POLICY "Only admin can manage rates"
ON public.life_insurance_rates
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create trigger for updated_at
CREATE TRIGGER update_life_insurance_rates_updated_at
BEFORE UPDATE ON public.life_insurance_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with realistic dummy data (monthly price per 100k NIS coverage)
INSERT INTO public.life_insurance_rates (age, price_per_100k_male_smoker, price_per_100k_male_nonsmoker, price_per_100k_female_smoker, price_per_100k_female_nonsmoker) VALUES
(18, 8.50, 4.20, 6.80, 3.40),
(19, 8.60, 4.30, 6.90, 3.45),
(20, 8.80, 4.40, 7.00, 3.50),
(21, 9.00, 4.50, 7.20, 3.60),
(22, 9.20, 4.60, 7.40, 3.70),
(23, 9.50, 4.75, 7.60, 3.80),
(24, 9.80, 4.90, 7.80, 3.90),
(25, 10.00, 5.00, 8.00, 4.00),
(26, 10.50, 5.25, 8.40, 4.20),
(27, 11.00, 5.50, 8.80, 4.40),
(28, 11.50, 5.75, 9.20, 4.60),
(29, 12.00, 6.00, 9.60, 4.80),
(30, 12.50, 6.25, 10.00, 5.00),
(31, 13.50, 6.75, 10.80, 5.40),
(32, 14.50, 7.25, 11.60, 5.80),
(33, 15.50, 7.75, 12.40, 6.20),
(34, 16.50, 8.25, 13.20, 6.60),
(35, 18.00, 9.00, 14.40, 7.20),
(36, 19.50, 9.75, 15.60, 7.80),
(37, 21.00, 10.50, 16.80, 8.40),
(38, 23.00, 11.50, 18.40, 9.20),
(39, 25.00, 12.50, 20.00, 10.00),
(40, 27.50, 13.75, 22.00, 11.00),
(41, 30.00, 15.00, 24.00, 12.00),
(42, 33.00, 16.50, 26.40, 13.20),
(43, 36.00, 18.00, 28.80, 14.40),
(44, 40.00, 20.00, 32.00, 16.00),
(45, 44.00, 22.00, 35.20, 17.60),
(46, 48.50, 24.25, 38.80, 19.40),
(47, 53.00, 26.50, 42.40, 21.20),
(48, 58.00, 29.00, 46.40, 23.20),
(49, 64.00, 32.00, 51.20, 25.60),
(50, 70.00, 35.00, 56.00, 28.00),
(51, 77.00, 38.50, 61.60, 30.80),
(52, 85.00, 42.50, 68.00, 34.00),
(53, 94.00, 47.00, 75.20, 37.60),
(54, 104.00, 52.00, 83.20, 41.60),
(55, 115.00, 57.50, 92.00, 46.00),
(56, 127.00, 63.50, 101.60, 50.80),
(57, 140.00, 70.00, 112.00, 56.00),
(58, 155.00, 77.50, 124.00, 62.00),
(59, 172.00, 86.00, 137.60, 68.80),
(60, 190.00, 95.00, 152.00, 76.00),
(61, 210.00, 105.00, 168.00, 84.00),
(62, 232.00, 116.00, 185.60, 92.80),
(63, 257.00, 128.50, 205.60, 102.80),
(64, 285.00, 142.50, 228.00, 114.00),
(65, 315.00, 157.50, 252.00, 126.00),
(66, 348.00, 174.00, 278.40, 139.20),
(67, 385.00, 192.50, 308.00, 154.00),
(68, 426.00, 213.00, 340.80, 170.40),
(69, 472.00, 236.00, 377.60, 188.80),
(70, 522.00, 261.00, 417.60, 208.80),
(71, 578.00, 289.00, 462.40, 231.20),
(72, 640.00, 320.00, 512.00, 256.00),
(73, 710.00, 355.00, 568.00, 284.00),
(74, 788.00, 394.00, 630.40, 315.20),
(75, 875.00, 437.50, 700.00, 350.00);