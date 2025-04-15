
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the client has sufficient funds for a loan payment
 */
export const checkClientFunds = async (clientId: string, amount: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', clientId)
      .single();

    if (error) throw error;
    
    return (data?.balance || 0) >= amount;
  } catch (error) {
    console.error('Error checking client funds:', error);
    return false;
  }
};

/**
 * Calculates payment details for a loan
 */
export const calculatePaymentDetails = async (
  principal: number, 
  interestRate: number, 
  durationMonths: number, 
  startDate?: string
) => {
  try {
    // Use the payment calculator edge function
    const response = await supabase.functions.invoke('loan-payment-calculator', {
      method: 'POST',
      body: {
        amount: principal,
        interestRate,
        durationMonths,
        startDate: startDate || new Date().toISOString()
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error calculating payment details:', error);
    throw new Error('Failed to calculate payment details');
  }
};

/**
 * Gets payment history for a loan
 */
export const getPaymentHistory = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw new Error('Failed to fetch payment history');
  }
};

/**
 * Gets remaining balance for a loan
 */
export const getLoanRemainingBalance = async (loanId: string): Promise<number> => {
  try {
    // Get loan details
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('amount, duration_months, monthly_payment')
      .eq('id', loanId)
      .single();

    if (loanError) throw loanError;

    // Get all payments made
    const { data: payments, error: paymentsError } = await supabase
      .from('loan_payments')
      .select('amount')
      .eq('loan_id', loanId)
      .eq('status', 'completed');

    if (paymentsError) throw paymentsError;

    // Calculate total amount paid
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate total due
    const totalDue = loan.monthly_payment * loan.duration_months;
    
    // Return the remaining balance
    return Math.max(0, totalDue - totalPaid);
  } catch (error) {
    console.error('Error calculating remaining balance:', error);
    throw new Error('Failed to calculate remaining balance');
  }
};
