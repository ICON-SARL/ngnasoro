
-- Create payment reminders table
CREATE TABLE IF NOT EXISTS public.loan_payment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES public.sfd_loans(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.sfd_clients(id) ON DELETE CASCADE,
  payment_number integer NOT NULL,
  payment_date timestamp with time zone NOT NULL,
  reminder_date timestamp with time zone NOT NULL,
  amount numeric NOT NULL,
  is_sent boolean NOT NULL DEFAULT false,
  sent_at timestamp with time zone,
  notification_id uuid,
  sms_status text,
  email_status text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS loan_payment_reminders_reminder_date_idx 
ON public.loan_payment_reminders(reminder_date);

CREATE INDEX IF NOT EXISTS loan_payment_reminders_loan_id_idx 
ON public.loan_payment_reminders(loan_id);

-- Add RPC function to update SFD account balance
CREATE OR REPLACE FUNCTION public.update_sfd_account_balance(
  p_sfd_id uuid,
  p_account_type text,
  p_amount numeric
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_id uuid;
BEGIN
  -- Find the account ID
  SELECT id INTO v_account_id
  FROM public.sfd_accounts
  WHERE sfd_id = p_sfd_id AND account_type = p_account_type;
  
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'SFD account of type % not found', p_account_type;
  END IF;
  
  -- Update the balance
  UPDATE public.sfd_accounts
  SET 
    balance = balance + p_amount,
    updated_at = now()
  WHERE id = v_account_id;
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE;
    RETURN false;
END;
$$;

-- Add Row Level Security
ALTER TABLE public.loan_payment_reminders ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to manage all payment reminders
CREATE POLICY "Admins can manage all payment reminders"
ON public.loan_payment_reminders
FOR ALL
TO authenticated
USING (
  public.is_admin()
);

-- Policy for SFD admins to view reminders for their SFD
CREATE POLICY "SFD admins can view reminders for their SFD"
ON public.loan_payment_reminders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sfd_loans sl
    JOIN public.user_sfds us ON sl.sfd_id = us.sfd_id
    WHERE sl.id = loan_id AND us.user_id = auth.uid()
  )
);

-- Create a database trigger to automatically schedule reminders for new loans
CREATE OR REPLACE FUNCTION public.schedule_loan_payment_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payment_date timestamp with time zone;
  reminder_date timestamp with time zone;
  client_id uuid;
BEGIN
  -- Only execute when loan is disbursed
  IF NEW.status = 'active' AND OLD.status = 'approved' THEN
    -- Get client ID
    SELECT id INTO client_id
    FROM public.sfd_clients
    WHERE id = NEW.client_id;
    
    -- Schedule payment reminders for each payment
    FOR i IN 1..NEW.duration_months LOOP
      -- Calculate payment date
      payment_date := NEW.disbursed_at + (i || ' month')::interval;
      
      -- Set reminder 5 days before payment
      reminder_date := payment_date - '5 days'::interval;
      
      -- Create reminder record
      INSERT INTO public.loan_payment_reminders (
        loan_id,
        client_id,
        payment_number,
        payment_date,
        reminder_date,
        amount,
        is_sent
      ) VALUES (
        NEW.id,
        client_id,
        i,
        payment_date,
        reminder_date,
        NEW.monthly_payment,
        false
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_loan_disbursed ON public.sfd_loans;
CREATE TRIGGER on_loan_disbursed
  AFTER UPDATE ON public.sfd_loans
  FOR EACH ROW
  EXECUTE PROCEDURE public.schedule_loan_payment_reminders();
