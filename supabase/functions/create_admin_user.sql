
-- Create a function to safely insert admin users (bypassing RLS)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_id UUID,
  admin_email TEXT,
  admin_full_name TEXT,
  admin_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Run with privileges of the function creator
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, full_name, role, has_2fa)
  VALUES (admin_id, admin_email, admin_full_name, admin_role, false);
END;
$$;
