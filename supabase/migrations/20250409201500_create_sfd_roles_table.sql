
-- Create SFD roles table for storing SFD staff roles
CREATE TABLE IF NOT EXISTS public.sfd_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID NOT NULL REFERENCES public.sfds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on sfd_roles
ALTER TABLE public.sfd_roles ENABLE ROW LEVEL SECURITY;

-- Only SFD admins can view roles for their SFD
CREATE POLICY "SFD admins can view their SFD roles" 
  ON public.sfd_roles 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_sfds WHERE sfd_id = sfd_roles.sfd_id
    )
    AND 
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'sfd_admin'
    )
  );

-- Only SFD admins can insert roles for their SFD
CREATE POLICY "SFD admins can create roles for their SFD" 
  ON public.sfd_roles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_sfds WHERE sfd_id = sfd_roles.sfd_id
    )
    AND 
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'sfd_admin'
    )
  );

-- Only SFD admins can update roles for their SFD
CREATE POLICY "SFD admins can update their SFD roles" 
  ON public.sfd_roles 
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_sfds WHERE sfd_id = sfd_roles.sfd_id
    )
    AND 
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'sfd_admin'
    )
  );

-- Only SFD admins can delete roles for their SFD
CREATE POLICY "SFD admins can delete their SFD roles" 
  ON public.sfd_roles 
  FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_sfds WHERE sfd_id = sfd_roles.sfd_id
    )
    AND 
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'sfd_admin'
    )
  );

-- Super admins and admins can view/manage all SFD roles
CREATE POLICY "Super admins and admins can manage all SFD roles" 
  ON public.sfd_roles 
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('super_admin', 'admin')
    )
  );
