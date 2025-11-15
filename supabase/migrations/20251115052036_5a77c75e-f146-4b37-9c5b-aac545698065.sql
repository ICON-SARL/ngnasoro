-- Insert test data for loans
-- First, get existing IDs we need

-- Insert test loan data
INSERT INTO sfd_loans (
  client_id,
  sfd_id,
  amount,
  duration_months,
  interest_rate,
  purpose,
  loan_plan_id,
  monthly_payment,
  total_amount,
  remaining_amount,
  next_payment_date,
  status,
  created_at
)
SELECT 
  sc.id as client_id,
  sc.sfd_id,
  250000 as amount,
  12 as duration_months,
  8.5 as interest_rate,
  'Achat de matériel agricole' as purpose,
  slp.id as loan_plan_id,
  22125 as monthly_payment,
  265500 as total_amount,
  265500 as remaining_amount,
  NOW() + INTERVAL '30 days' as next_payment_date,
  'active' as status,
  NOW() - INTERVAL '15 days' as created_at
FROM sfd_clients sc
JOIN sfd_loan_plans slp ON slp.sfd_id = sc.sfd_id
WHERE sc.user_id IS NOT NULL
  AND slp.is_active = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert another test loan (pending)
INSERT INTO sfd_loans (
  client_id,
  sfd_id,
  amount,
  duration_months,
  interest_rate,
  purpose,
  loan_plan_id,
  monthly_payment,
  total_amount,
  remaining_amount,
  next_payment_date,
  status,
  created_at
)
SELECT 
  sc.id as client_id,
  sc.sfd_id,
  150000 as amount,
  6 as duration_months,
  7.0 as interest_rate,
  'Développement commerce' as purpose,
  slp.id as loan_plan_id,
  25750 as monthly_payment,
  154500 as total_amount,
  154500 as remaining_amount,
  NOW() + INTERVAL '30 days' as next_payment_date,
  'pending' as status,
  NOW() - INTERVAL '3 days' as created_at
FROM sfd_clients sc
JOIN sfd_loan_plans slp ON slp.sfd_id = sc.sfd_id
WHERE sc.user_id IS NOT NULL
  AND slp.is_active = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert test loan payment for the first loan
INSERT INTO loan_payments (
  loan_id,
  amount,
  payment_method,
  status,
  reference,
  created_at
)
SELECT 
  sl.id as loan_id,
  22125 as amount,
  'cash' as payment_method,
  'completed' as status,
  'PAY-' || SUBSTRING(gen_random_uuid()::text, 1, 8) as reference,
  NOW() - INTERVAL '10 days' as created_at
FROM sfd_loans sl
WHERE sl.status = 'active'
  AND sl.amount = 250000
LIMIT 1
ON CONFLICT DO NOTHING;