-- Create quizzes table for interactive quiz builder
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  steps_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view active quizzes"
  ON public.quizzes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can view all quizzes"
  ON public.quizzes FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Only admin can manage quizzes"
  ON public.quizzes FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Add is_landing_page to pages table
ALTER TABLE public.pages ADD COLUMN is_landing_page BOOLEAN NOT NULL DEFAULT false;

-- Create trigger for updated_at on quizzes
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();