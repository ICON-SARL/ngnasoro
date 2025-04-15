
-- Update the get_role_permissions function to ensure it's aligned with our TypeScript code
CREATE OR REPLACE FUNCTION public.get_role_permissions(role_name text)
RETURNS SETOF text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Returns permissions for SuperAdmin or Admin
  IF role_name = 'admin' THEN
    RETURN QUERY SELECT unnest(ARRAY[
      'validate_sfd_funds', 'audit_sfd_accounts', 'generate_reports',
      'manage_users', 'manage_sfds', 'manage_clients', 'manage_loans',
      'manage_subsidies', 'view_reports', 'export_data', 'approve_credit',
      'access_admin_dashboard', 'view_client_adhesions', 'create_sfd',
      'create_sfd_admin', 'audit_reports', 'pki_management'
    ]);
  -- Returns permissions for SFD Admin
  ELSIF role_name = 'sfd_admin' THEN
    RETURN QUERY SELECT unnest(ARRAY[
      'validate_client_accounts', 'create_client_accounts', 'manage_sfd_loans',
      'manage_sfd_repayments', 'manage_sfd_savings', 'validate_mobile_money',
      'manage_clients', 'manage_loans', 'access_sfd_dashboard', 'manage_subsidies',
      'approve_client_adhesion', 'reject_client_adhesion', 'view_client_adhesions'
    ]);
  -- Returns permissions for Client
  ELSIF role_name = 'client' THEN
    RETURN QUERY SELECT unnest(ARRAY[
      'access_savings', 'deposit_savings', 'withdraw_savings',
      'use_mobile_money', 'view_loan_history', 'access_client_dashboard',
      'request_adhesion', 'request_loan', 'repay_loan'
    ]);
  -- Returns basic permissions for regular user
  ELSIF role_name = 'user' THEN
    RETURN QUERY SELECT unnest(ARRAY['request_adhesion']);
  ELSE
    RETURN QUERY SELECT ''::text WHERE false;
  END IF;
END;
$$;

-- Add function to verify if a user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  has_perm boolean := false;
BEGIN
  -- Get the user's role from user_roles table
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = $1 
  LIMIT 1;
  
  -- If no role found, check app_metadata
  IF user_role IS NULL THEN
    SELECT raw_app_meta_data->>'role' INTO user_role
    FROM auth.users
    WHERE id = $1;
  END IF;
  
  -- Check if the permission is in the role's permissions
  IF user_role IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM get_role_permissions(user_role) 
      WHERE get_role_permissions = $2
    ) INTO has_perm;
  END IF;
  
  RETURN has_perm;
END;
$$;

-- Add real-time permission checking function
CREATE OR REPLACE FUNCTION public.check_real_time_permission(user_id uuid, permission_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  has_perm boolean;
BEGIN
  -- Check if user has permission
  SELECT has_permission(user_id, permission_name) INTO has_perm;
  
  -- Return result with timestamp for verification of real-time check
  SELECT jsonb_build_object(
    'user_id', user_id,
    'permission', permission_name,
    'has_permission', has_perm,
    'checked_at', now(),
    'source', 'database_real_time_check'
  ) INTO result;
  
  RETURN result;
END;
$$;
