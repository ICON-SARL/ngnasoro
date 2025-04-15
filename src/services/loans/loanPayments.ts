
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches payment history for a specific loan
 */
export const getLoanPayments = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching loan payments:', error);
    throw new Error('Failed to fetch loan payment history');
  }
};

/**
 * Records a payment for a loan
 */
export const recordLoanPayment = async (
  loanId: string, 
  amount: number, 
  paymentMethod: string,
  recordedBy: string
) => {
  try {
    // 1. Create the payment record
    const { data, error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_method: paymentMethod,
        status: 'completed',
        payment_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Update the loan's payment information
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const { error: updateError } = await supabase
      .from('sfd_loans')
      .update({
        last_payment_date: today.toISOString(),
        next_payment_date: nextMonth.toISOString()
      })
      .eq('id', loanId);
      
    if (updateError) throw updateError;
    
    // 3. Log the activity
    await supabase.from('loan_activities').insert({
      loan_id: loanId,
      activity_type: 'payment_recorded',
      description: `Payment of ${amount} FCFA recorded via ${paymentMethod}`,
      performed_by: recordedBy
    });

    return data;
  } catch (error) {
    console.error('Error recording loan payment:', error);
    throw error;
  }
};

/**
 * Sends a payment reminder to a client
 */
export const sendPaymentReminder = async (loanId: string) => {
  try {
    // This would typically call an API that sends emails/SMS
    // For now, we'll just log it in the database

    await supabase.from('loan_activities').insert({
      loan_id: loanId,
      activity_type: 'payment_reminder',
      description: 'Payment reminder sent manually'
    });

    return true;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return false;
  }
};
