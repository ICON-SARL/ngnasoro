
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';

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
    reference: '',
    updated_at: data.created_at,
    subsidy_amount: data.subsidy_amount || 0,
    subsidy_rate: data.subsidy_rate || 0
  };
  
  return loan;
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
  
  return data.map(loan => ({
    ...loan,
    client_name: loan.sfd_clients?.full_name || 'Unknown Client',
    reference: '',
    updated_at: loan.created_at,
    subsidy_amount: loan.subsidy_amount || 0,
    subsidy_rate: loan.subsidy_rate || 0
  })) as Loan[];
};
