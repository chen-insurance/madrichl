-- Add status column to leads table for CRM functionality
ALTER TABLE public.leads
ADD COLUMN status text DEFAULT 'new';

-- Add index for status filtering
CREATE INDEX idx_leads_status ON public.leads(status);

-- Allow admin to update leads (for status changes)
CREATE POLICY "Only admin can update leads"
  ON public.leads FOR UPDATE
  USING (is_admin_user())
  WITH CHECK (is_admin_user());