
-- Add is_published field to sfd_loan_plans table
ALTER TABLE public.sfd_loan_plans 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Create a table to track loan plan views/interactions
CREATE TABLE IF NOT EXISTS public.loan_plan_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_plan_id uuid REFERENCES public.sfd_loan_plans(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'view', 'click', 'apply', etc.
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for the new table
ALTER TABLE public.loan_plan_interactions ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own interactions
CREATE POLICY "Users can insert their own interactions"
ON public.loan_plan_interactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own interactions
CREATE POLICY "Users can view their own interactions"
ON public.loan_plan_interactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow SFD admins to view interactions for their SFD's loan plans
CREATE POLICY "SFD admins can view interactions for their loan plans"
ON public.loan_plan_interactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sfd_loan_plans
    JOIN public.user_sfds ON sfd_loan_plans.sfd_id = user_sfds.sfd_id
    WHERE sfd_loan_plans.id = loan_plan_interactions.loan_plan_id
    AND user_sfds.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'sfd_admin'
    )
  )
);

-- Allow super admins to view all interactions
CREATE POLICY "Super admins can view all interactions"
ON public.loan_plan_interactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
