import { supabase } from '@/integrations/supabase/client';
import { Loan, LoanPayment } from '@/types/sfdClients';

// Record loan payment
export const recordLoanPayment = async (
  loanId: string,
  amount: number,
  paymentMethod: string,
  transactionId?: string
): Promise<LoanPayment | null> => {
  try {
    // First get loan details to verify payment
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (loanError) {
      console.error('Error fetching loan for payment:', loanError);
      throw new Error(loanError.message);
    }

    // Record the payment
    const { data, error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        payment_date: new Date().toISOString(),
        status: 'completed'
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording loan payment:', error);
      throw new Error(error.message);
    }

    // Update the loan with the new payment info
    const now = new Date().toISOString();
    await supabase
      .from('sfd_loans')
      .update({
        last_payment_date: now,
        // Calculate next payment date based on monthly schedule
        next_payment_date: new Date(now).setMonth(new Date(now).getMonth() + 1)
      })
      .eq('id', loanId);

    // Cast to ensure the type is correct
    return data as LoanPayment;
  } catch (error) {
    console.error('Error in recordLoanPayment:', error);
    return null;
  }
};

// Get loan payments
export const getLoanPayments = async (loanId: string): Promise<LoanPayment[]> => {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching loan payments:', error);
      throw new Error(error.message);
    }

    return data as LoanPayment[];
  } catch (error) {
    console.error('Error in getLoanPayments:', error);
    return [];
  }
};

// Send payment reminder
export const sendPaymentReminder = async (loanId: string): Promise<boolean> => {
  try {
    // Implement your notification logic here
    console.log(`Payment reminder sent for loan ID: ${loanId}`);
    return true;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return false;
  }
};
