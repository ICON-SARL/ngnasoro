
-- NOTE: This file is for documentation purposes only
-- This migration should be executed through Supabase CLI or dashboard

-- Create a table to store SFD-specific roles
CREATE TABLE IF NOT EXISTS public.sfd_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID NOT NULL REFERENCES public.sfds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for fast lookups by SFD ID
CREATE INDEX IF NOT EXISTS sfd_roles_sfd_id_idx ON public.sfd_roles(sfd_id);

-- Enable Row Level Security
ALTER TABLE public.sfd_roles ENABLE ROW LEVEL SECURITY;

-- Add policies to restrict access
CREATE POLICY "SFD admins can manage their own roles"
  ON public.sfd_roles
  USING (
    sfd_id IN (
      SELECT sfd_id FROM user_sfds 
      WHERE user_id = auth.uid()
    )
  );

-- Ensure admin_roles can be used for SFD roles as well
ALTER TABLE public.admin_roles ADD COLUMN IF NOT EXISTS sfd_id UUID REFERENCES public.sfds(id);
