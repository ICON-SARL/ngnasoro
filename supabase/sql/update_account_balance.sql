
-- Create a function to update account balance with proper validation
CREATE OR REPLACE FUNCTION public.update_account_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM public.accounts
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found for user %', p_user_id;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;
  
  -- Check for negative balance if it's a withdrawal
  IF p_amount < 0 AND v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient funds. Current balance: %', v_current_balance;
  END IF;
  
  -- Update the balance
  UPDATE public.accounts
  SET 
    balance = v_new_balance,
    last_updated = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
