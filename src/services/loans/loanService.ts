
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';

/**
 * Fetch a loan by its ID
 */
export const fetchLoanById = async (loanId: string): Promise<Loan | null> => {
  try {
    // Query the database for the loan with the matching ID
    const { data, error } = await supabase
      .from('sfd_loans')
      .select('*, sfds:sfd_id(name)')
      .eq('id', loanId)
      .single();

    if (error) {
      console.error('Error fetching loan:', error);
      return null;
    }

    return data as Loan;
  } catch (error) {
    console.error('Error in fetchLoanById:', error);
    return null;
  }
};

/**
 * Create a new loan
 */
export const createLoan = async (loanData: any) => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .insert([loanData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
};

/**
 * Get all SFD loans
 */
export const getSfdLoans = async () => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select('*, sfds:sfd_id(name)');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching SFD loans:', error);
    return [];
  }
};

/**
 * Approve a loan
 */
export const approveLoan = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', loanId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error approving loan:', error);
    throw error;
  }
};

/**
 * Reject a loan
 */
export const rejectLoan = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error rejecting loan:', error);
    throw error;
  }
};

/**
 * Disburse a loan
 */
export const disburseLoan = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'active',
        disbursed_at: new Date().toISOString()
      })
      .eq('id', loanId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error disbursing loan:', error);
    throw error;
  }
};

/**
 * Record loan payment
 */
export const recordLoanPayment = async (loanId: string, amount: number, paymentMethod: string) => {
  try {
    // First, create the payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('loan_payments')
      .insert([{
        loan_id: loanId,
        amount,
        payment_method: paymentMethod
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Then update the loan's last payment date
    const { data: loanData, error: loanError } = await supabase
      .from('sfd_loans')
      .update({
        last_payment_date: new Date().toISOString()
      })
      .eq('id', loanId)
      .select()
      .single();

    if (loanError) throw loanError;

    return { paymentRecord, loanData };
  } catch (error) {
    console.error('Error recording loan payment:', error);
    throw error;
  }
};

/**
 * Get loan payments
 */
export const getLoanPayments = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching loan payments:', error);
    return [];
  }
};

/**
 * Send payment reminder
 */
export const sendPaymentReminder = async (loanId: string) => {
  try {
    // In a real app, this would integrate with a notification service
    console.log(`Payment reminder sent for loan: ${loanId}`);
    return true;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return false;
  }
};
