
-- Create materialized view for loan reporting
CREATE MATERIALIZED VIEW IF NOT EXISTS loan_reporting_mv AS
SELECT 
  l.id,
  l.client_id,
  l.sfd_id,
  l.amount,
  l.duration_months,
  l.interest_rate,
  l.status,
  l.purpose,
  l.disbursement_status,
  l.monthly_payment,
  l.created_at,
  l.approved_at,
  l.disbursed_at,
  l.next_payment_date,
  l.last_payment_date,
  l.subsidy_amount,
  l.subsidy_rate,
  s.name AS sfd_name,
  s.code AS sfd_code,
  s.region AS sfd_region,
  c.full_name AS client_name,
  c.kyc_level AS client_kyc_level
FROM 
  sfd_loans l
  JOIN sfds s ON l.sfd_id = s.id
  JOIN sfd_clients c ON l.client_id = c.id;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS loan_reporting_mv_sfd_id_idx ON loan_reporting_mv(sfd_id);
CREATE INDEX IF NOT EXISTS loan_reporting_mv_status_idx ON loan_reporting_mv(status);
CREATE INDEX IF NOT EXISTS loan_reporting_mv_created_at_idx ON loan_reporting_mv(created_at);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_loan_reporting_mv()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW loan_reporting_mv;
  INSERT INTO audit_logs (action, category, severity, status, details)
  VALUES (
    'refresh_materialized_view',
    'SYSTEM',
    'INFO',
    'success',
    jsonb_build_object('view_name', 'loan_reporting_mv', 'refresh_time', now())
  );
EXCEPTION WHEN OTHERS THEN
  INSERT INTO audit_logs (action, category, severity, status, error_message, details)
  VALUES (
    'refresh_materialized_view',
    'SYSTEM',
    'ERROR',
    'failure',
    SQLERRM,
    jsonb_build_object('view_name', 'loan_reporting_mv', 'refresh_time', now())
  );
  RAISE;
END;
$$;

-- Schedule the refresh every 15 minutes using pg_cron
-- First, make sure the extension is available
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job
SELECT cron.schedule(
  'refresh-loan-reporting-view',
  '*/15 * * * *',  -- Run every 15 minutes
  $$
  SELECT refresh_loan_reporting_mv();
  $$
);
