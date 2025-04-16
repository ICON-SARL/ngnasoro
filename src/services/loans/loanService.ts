import { supabase } from '@/integrations/supabase/client';
import { Loan, CreateLoanInput } from '@/types/sfdClients';
import { calculateLoanDetails } from './loanCalculations';

/**
 * Create a new loan application
 */
export const createLoan = async (loanData: CreateLoanInput): Promise<Loan> => {
  try {
    // Calculate loan details based on plan
    const loanDetails = calculateLoanDetails(
      loanData.amount, 
      loanData.duration_months, 
      loanData.interest_rate
    );

    // Insert loan application
    const { data, error } = await supabase
      .from('sfd_loans')
      .insert({
        ...loanData,
        monthly_payment: loanDetails.monthlyPayment,
        status: 'pending',
        created_at: new Date().toISOString()
      })
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
 * Approve a loan application
 */
export const approveLoan = async (loanId: string, approverId: string): Promise<Loan> => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approverId
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
 * Reject a loan application
 */
export const rejectLoan = async (loanId: string, rejecterId: string, reason?: string): Promise<Loan> => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'rejected',
        approved_at: new Date().toISOString(),
        approved_by: rejecterId,
        // Store rejection reason in notes or another field if available
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
 * Disburse an approved loan
 */
export const disburseLoan = async (loanId: string, disburserId: string): Promise<Loan> => {
  try {
    // First, check SFD account balance
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('amount, sfd_id')
      .eq('id', loanId)
      .single();

    if (loanError) throw loanError;

    const { data: account, error: accountError } = await supabase
      .from('sfd_accounts')
      .select('balance')
      .eq('sfd_id', loan.sfd_id)
      .eq('account_type', 'operation')
      .single();

    if (accountError) throw accountError;

    // Check if sufficient funds are available
    if (account.balance < loan.amount) {
      throw new Error('Insufficient funds in SFD account');
    }

    // Update loan status and create disbursement record
    const { data, error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'active',
        disbursed_at: new Date().toISOString(),
        disbursement_status: 'completed'
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
 * Get all loans for an SFD
 */
export const getSfdLoans = async (sfdId: string): Promise<Loan[]> => {
  try {
    console.log('Fetching loans for SFD ID:', sfdId);
    
    if (!sfdId) {
      console.warn('No SFD ID provided to getSfdLoans');
      return [];
    }
    
    const { data, error } = await supabase
      .from('sfd_loans')
      .select('*, sfd_clients(full_name)')
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getSfdLoans:', error);
      throw error;
    }

    // Format the response to include client_name
    return data.map(loan => ({
      ...loan,
      client_name: loan.sfd_clients?.full_name || null
    }));
  } catch (error) {
    console.error('Error fetching SFD loans:', error);
    return []; // Return empty array instead of throwing error
  }
};

/**
 * Get details of a specific loan
 */
export const fetchLoanById = async (loanId: string): Promise<Loan | null> => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select('*, sfd_clients(full_name)')
      .eq('id', loanId)
      .single();

    if (error) throw error;

    return {
      ...data,
      client_name: data.sfd_clients?.full_name || null
    };
  } catch (error) {
    console.error('Error fetching loan details:', error);
    return null;
  }
};

/**
 * Record a payment for a loan
 */
export const recordLoanPayment = async (
  loanId: string, 
  amount: number, 
  paymentMethod: string
): Promise<any> => {
  try {
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

    // Update loan status if needed
    // For example, check if all payments are complete

    return data;
  } catch (error) {
    console.error('Error recording loan payment:', error);
    throw error;
  }
};

/**
 * Get all payments for a loan
 */
export const getLoanPayments = async (loanId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching loan payments:', error);
    return [];
  }
};

/**
 * Send a payment reminder for a loan
 */
export const sendPaymentReminder = async (loanId: string): Promise<boolean> => {
  try {
    // Get loan and client details
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*, sfd_clients(full_name, phone, email)')
      .eq('id', loanId)
      .single();

    if (loanError) throw loanError;

    // Create a reminder record
    const { error: reminderError } = await supabase
      .from('loan_payment_reminders')
      .insert({
        loan_id: loanId,
        client_id: loan.client_id,
        payment_number: 1, // This should be calculated based on payment history
        payment_date: loan.next_payment_date || new Date().toISOString(),
        reminder_date: new Date().toISOString(),
        amount: loan.monthly_payment,
        is_sent: true,
        sent_at: new Date().toISOString()
      });

    if (reminderError) throw reminderError;

    // In a real implementation, send SMS/email here
    console.log(`Reminder sent to ${loan.sfd_clients.full_name} for loan ${loanId}`);

    return true;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return false;
  }
};
