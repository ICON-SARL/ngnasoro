
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
    // Since client_name is now in our Loan type, we can assign it
    client_name: data.sfd_clients?.full_name || 'Unknown Client',
    // Make sure all required properties are present
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
    // Handle optional properties safely with optional chaining and nullish coalescing
    reference: data.reference ?? '',
    updated_at: data.updated_at ?? data.created_at
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
