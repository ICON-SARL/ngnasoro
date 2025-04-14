
-- Create credit applications table
CREATE TABLE IF NOT EXISTS public.credit_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL,
  sfd_id UUID NOT NULL REFERENCES public.sfds(id),
  amount NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID,
  approval_comments TEXT,
  rejection_reason TEXT,
  rejection_comments TEXT
);

-- Add index on reference and status for faster lookups
CREATE INDEX IF NOT EXISTS credit_applications_reference_idx ON public.credit_applications(reference);
CREATE INDEX IF NOT EXISTS credit_applications_status_idx ON public.credit_applications(status);
CREATE INDEX IF NOT EXISTS credit_applications_sfd_id_idx ON public.credit_applications(sfd_id);

-- Add Row Level Security
ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;

-- Policy to allow SFD admins to read only their SFD's credit applications
CREATE POLICY "SFD admins can view their own credit applications"
  ON public.credit_applications
  FOR SELECT
  USING (
    (auth.uid() IN (
      SELECT user_id FROM user_sfds WHERE sfd_id = credit_applications.sfd_id
    )) OR
    (public.is_admin())
  );

-- Policy to allow SFD admins to create credit applications
CREATE POLICY "SFD admins can create credit applications"
  ON public.credit_applications
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_sfds WHERE sfd_id = credit_applications.sfd_id
    )
  );

-- Only super admins can update credit applications
CREATE POLICY "Only super admins can update credit applications"
  ON public.credit_applications
  FOR UPDATE
  USING (public.is_admin());
