
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';

export interface CreateLoanInput {
  client_id: string;
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  purpose: string;
  monthly_payment: number;
  subsidy_amount?: number;
  subsidy_rate?: number;
}

/**
 * Fetches a loan by its ID along with client information
 */
export const fetchLoanById = async (loanId: string): Promise<Loan | null> => {
  if (!loanId) return null;
  
  const { data, error } = await supabase
    .from('sfd_loans')
    .select('*, sfd_clients(full_name, email)')
    .eq('id', loanId)
    .single();
  
  if (error) {
    console.error('Error fetching loan:', error);
    return null;
  }
  
  // Format the loan data with client information
  const loan: Loan = {
    ...data,
    client_name: data.sfd_clients?.full_name || 'Unknown Client',
    id: data.id,
    client_id: data.client_id,
    sfd_id: data.sfd_id,
    amount: data.amount,
    duration_months: data.duration_months,
    interest_rate: data.interest_rate,
    monthly_payment: data.monthly_payment,
    purpose: data.purpose,
    status: data.status || 'pending',
    created_at: data.created_at,
    reference: data.reference ?? '',
    updated_at: data.updated_at ?? data.created_at,
    subsidy_amount: data.subsidy_amount || 0,
    subsidy_rate: data.subsidy_rate || 0
  };
  
  return loan;
};

/**
 * Creates a new loan
 */
export const createLoan = async (loanData: CreateLoanInput): Promise<Loan | null> => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .insert([loanData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating loan:', error);
      return null;
    }
    
    return data as Loan;
  } catch (error) {
    console.error('Error creating loan:', error);
    return null;
  }
};

/**
 * Fetches all loans for an SFD
 */
export const getSfdLoans = async (): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from('sfd_loans')
    .select('*, sfd_clients(full_name, email)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
  
  // Ensure the returned data conforms to the Loan type
  return data.map(loan => ({
    ...loan,
    client_name: loan.sfd_clients?.full_name || 'Unknown Client',
    reference: loan.reference ?? '',
    updated_at: loan.updated_at ?? loan.created_at,
    subsidy_amount: loan.subsidy_amount || 0,
    subsidy_rate: loan.subsidy_rate || 0
  })) as Loan[];
};

/**
 * Approves a loan
 */
export const approveLoan = async (loanId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sfd_loans')
    .update({ 
      status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString()
    })
    .eq('id', loanId);
  
  if (error) {
    console.error('Error approving loan:', error);
    return false;
  }
  
  return true;
};

/**
 * Rejects a loan
 */
export const rejectLoan = async (loanId: string, userId: string, reason?: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sfd_loans')
    .update({ 
      status: 'rejected',
      approved_by: userId,
      approved_at: new Date().toISOString()
    })
    .eq('id', loanId);
  
  if (error) {
    console.error('Error rejecting loan:', error);
    return false;
  }
  
  return true;
};

/**
 * Disburses (activates) a loan
 */
export const disburseLoan = async (loanId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sfd_loans')
    .update({ 
      status: 'active',
      disbursed_at: new Date().toISOString()
    })
    .eq('id', loanId);
  
  if (error) {
    console.error('Error disbursing loan:', error);
    return false;
  }
  
  return true;
};

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
    .order('payment_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching loan payments:', error);
    return [];
  }
  
  return data;
};

/**
 * Gets loan details by ID
 */
export const getLoanById = async (loanId: string): Promise<Loan | null> => {
  return fetchLoanById(loanId);
};

/**
 * Sends a payment reminder
 */
export const sendPaymentReminder = async (loanId: string): Promise<boolean> => {
  console.log(`Sending payment reminder for loan ${loanId}`);
  // In a real implementation, this would call an API to send an SMS or email
  return true;
};
