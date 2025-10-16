
import { supabase } from '@/integrations/supabase/client';

/**
 * Records a payment for a loan
 */
export const recordLoanPayment = async (
  loanId: string, 
  amount: number, 
  paymentMethod: string, 
  userId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('loan_payments')
    .insert({
      loan_id: loanId,
      amount,
      payment_method: paymentMethod,
      status: 'completed'
    });
  
  if (error) {
    console.error('Error recording payment:', error);
    return false;
  }
  
  return true;
};

/**
 * Fetches payments for a specific loan
 */
export const getLoanPayments = async (loanId: string) => {
  const { data, error } = await supabase
    .from('loan_payments')
    .select('*')
    .eq('loan_id', loanId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching loan payments:', error);
    return [];
  }
  
  return data;
};

/**
 * Sends a payment reminder
 */
export const sendPaymentReminder = async (loanId: string): Promise<boolean> => {
  console.log(`Sending payment reminder for loan ${loanId}`);
  // In a real implementation, this would call an API to send an SMS or email
  return true;
};
