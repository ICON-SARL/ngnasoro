
-- Create the sfd_loan_plans table
CREATE TABLE IF NOT EXISTS public.sfd_loan_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sfd_id uuid REFERENCES public.sfds(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  min_amount numeric NOT NULL DEFAULT 10000,
  max_amount numeric NOT NULL DEFAULT 5000000,
  min_duration integer NOT NULL DEFAULT 1,
  max_duration integer NOT NULL DEFAULT 36,
  interest_rate numeric NOT NULL DEFAULT 5.0,
  fees numeric NOT NULL DEFAULT 1.0,
  requirements text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.sfd_loan_plans ENABLE ROW LEVEL SECURITY;

-- Policy for SFD admins to manage their own loan plans
CREATE POLICY "SFD Admins can manage their own loan plans"
ON public.sfd_loan_plans
FOR ALL
TO authenticated
USING (
  (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'sfd_admin'
  ))
  AND
  (sfd_id IN (
    SELECT sfd_id FROM public.user_sfds WHERE user_id = auth.uid()
  ))
);

-- Policy for authenticated users to view active loan plans of their connected SFDs
CREATE POLICY "Users can view active loan plans of their SFDs"
ON public.sfd_loan_plans
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND
  sfd_id IN (
    SELECT sfd_id FROM public.user_sfds WHERE user_id = auth.uid()
  )
);

-- Policy for super admins to view all loan plans
CREATE POLICY "Super admins can manage all loan plans"
ON public.sfd_loan_plans
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);
