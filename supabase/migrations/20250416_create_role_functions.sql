
-- Create function to get permissions for a role
CREATE OR REPLACE FUNCTION public.get_role_permissions(role_name text)
RETURNS SETOF text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Returns permissions for SuperAdmin
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
