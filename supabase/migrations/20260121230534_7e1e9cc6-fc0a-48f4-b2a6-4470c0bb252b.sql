-- =====================================================
-- PHASE 2 & 3: Fix RLS Policies + Create Payment Trigger
-- =====================================================

-- 1. Drop overly permissive RLS policies on cash_operations
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON cash_operations;
DROP POLICY IF EXISTS "Users can create cash operations" ON cash_operations;

-- 2. Create secure policy for cash_operations INSERT
CREATE POLICY "Cashiers can insert operations for their sessions" 
ON cash_operations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cash_sessions cs
    WHERE cs.id = session_id
    AND cs.cashier_id = auth.uid()
    AND cs.status = 'open'
  )
);

-- 3. Drop overly permissive RLS policies on cashier_qr_codes
DROP POLICY IF EXISTS "Allow update for authenticated users" ON cashier_qr_codes;
DROP POLICY IF EXISTS "Users can update QR codes" ON cashier_qr_codes;

-- 4. Create secure policy for cashier_qr_codes UPDATE
CREATE POLICY "Cashiers and SFD admins can update QR codes" 
ON cashier_qr_codes 
FOR UPDATE 
USING (
  cashier_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_sfds us
    WHERE us.user_id = auth.uid()
    AND us.sfd_id = cashier_qr_codes.sfd_id
  )
);

-- 5. Create trigger function for automatic remaining_amount update on MEREF loan payments
CREATE OR REPLACE FUNCTION public.update_meref_loan_remaining()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE meref_sfd_loans
  SET 
    remaining_amount = GREATEST(0, remaining_amount - NEW.amount),
    last_payment_date = CURRENT_DATE,
    payments_made = COALESCE(payments_made, 0) + 1,
    next_payment_date = CASE 
      WHEN remaining_amount - NEW.amount <= 0 THEN NULL
      ELSE (CURRENT_DATE + INTERVAL '1 month')::DATE
    END,
    status = CASE 
      WHEN remaining_amount - NEW.amount <= 0 THEN 'completed'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.meref_loan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_meref_loan_remaining ON meref_sfd_loan_payments;

CREATE TRIGGER trigger_update_meref_loan_remaining
AFTER INSERT ON meref_sfd_loan_payments
FOR EACH ROW
EXECUTE FUNCTION update_meref_loan_remaining();