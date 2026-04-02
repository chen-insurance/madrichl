-- Fix policies scoped to {public} instead of {authenticated}

-- CTA blocks
DROP POLICY IF EXISTS "Only admin can manage CTA blocks" ON public.cta_blocks;
CREATE POLICY "Only admin can manage CTA blocks"
ON public.cta_blocks FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Quizzes
DROP POLICY IF EXISTS "Only admin can manage quizzes" ON public.quizzes;
CREATE POLICY "Only admin can manage quizzes"
ON public.quizzes FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Life insurance rates
DROP POLICY IF EXISTS "Only admin can manage rates" ON public.life_insurance_rates;
CREATE POLICY "Only admin can manage rates"
ON public.life_insurance_rates FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Glossary terms
DROP POLICY IF EXISTS "Only admin can manage glossary terms" ON public.glossary_terms;
CREATE POLICY "Only admin can manage glossary terms"
ON public.glossary_terms FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Article categories
DROP POLICY IF EXISTS "Only admin can manage article categories" ON public.article_categories;
CREATE POLICY "Only admin can manage article categories"
ON public.article_categories FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Leads update policy
DROP POLICY IF EXISTS "Only admin can update leads" ON public.leads;
CREATE POLICY "Only admin can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Redirects
DROP POLICY IF EXISTS "Only admin can manage redirects" ON public.redirects;
CREATE POLICY "Only admin can manage redirects"
ON public.redirects FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());