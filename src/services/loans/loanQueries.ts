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
export const getSfdLoans = async (sfdId?: string): Promise<Loan[]> => {
  try {
    // If no SFD ID is provided, attempt to get it from the user session
    if (!sfdId) {
      const { data: { session } } = await supabase.auth.getSession();
      sfdId = session?.user?.user_metadata?.sfd_id;
      
      if (!sfdId) {
        console.error('No SFD ID provided or found in session');
        return [];
      }
    }
    
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfd_clients (
          full_name,
          email,
          phone
        )
      `)
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching SFD loans:', error);
      throw error;
    }
    
    // Process the data to ensure it conforms to the Loan type
    return data.map(loan => {
      // Ensure status is one of the allowed values
      const status = loan.status as Loan['status']; 
      
      return {
        ...loan,
        client_name: loan.sfd_clients?.full_name || 'Client #' + loan.client_id.substring(0, 4),
        status: status || 'pending', // Default to pending if status is invalid
        // ...other derived fields
      } as Loan;
    });
  } catch (error) {
    console.error('Error in getSfdLoans:', error);
    return [];
  }
};
