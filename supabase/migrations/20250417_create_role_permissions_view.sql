
-- Create a view to make it easier to query role permissions
CREATE OR REPLACE VIEW public.role_permissions_view AS
  SELECT 
    CAST('admin' AS text) as role,
    unnest(ARRAY[
      'validate_sfd_funds', 'audit_sfd_accounts', 'generate_reports',
      'manage_users', 'manage_sfds', 'manage_clients', 'manage_loans',
      'manage_subsidies', 'view_reports', 'export_data', 'approve_credit',
      'access_admin_dashboard', 'view_client_adhesions', 'create_sfd',
      'create_sfd_admin', 'audit_reports', 'pki_management'
    ]) as permission
  UNION ALL
  SELECT 
    CAST('sfd_admin' AS text) as role,
    unnest(ARRAY[
      'validate_client_accounts', 'create_client_accounts', 'manage_sfd_loans',
      'manage_sfd_repayments', 'manage_sfd_savings', 'validate_mobile_money',
      'manage_clients', 'manage_loans', 'access_sfd_dashboard', 'manage_subsidies',
      'approve_client_adhesion', 'reject_client_adhesion', 'view_client_adhesions'
    ]) as permission
  UNION ALL
  SELECT 
    CAST('client' AS text) as role,
    unnest(ARRAY[
      'access_savings', 'deposit_savings', 'withdraw_savings',
      'use_mobile_money', 'view_loan_history', 'access_client_dashboard',
      'request_adhesion', 'request_loan', 'repay_loan'
    ]) as permission
  UNION ALL
  SELECT 
    CAST('user' AS text) as role,
    unnest(ARRAY['request_adhesion']) as permission;

-- Update the test-roles edge function to use this view instead of the RPC functions
COMMENT ON VIEW public.role_permissions_view IS 'View that lists all permissions for each role';
