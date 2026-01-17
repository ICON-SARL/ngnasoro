-- Create trigger function to update loan status after payment
CREATE OR REPLACE FUNCTION public.update_loan_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the remaining amount on the loan
  UPDATE sfd_loans
  SET 
    remaining_amount = remaining_amount - NEW.amount,
    updated_at = NOW()
  WHERE id = NEW.loan_id;
  
  -- If loan is fully repaid, update status to completed
  UPDATE sfd_loans
  SET status = 'completed'
  WHERE id = NEW.loan_id
  AND remaining_amount <= 0
  AND status != 'completed';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on loan_payments
DROP TRIGGER IF EXISTS on_loan_payment ON loan_payments;
CREATE TRIGGER on_loan_payment
  AFTER INSERT ON loan_payments
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_loan_on_payment();