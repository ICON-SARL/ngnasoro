
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';

/**
 * Fetches all loans for a specific SFD
 */
export const getSfdLoans = async (sfdId: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        client:client_id (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching SFD loans:', error);
    throw new Error('Failed to fetch loans');
  }
};

/**
 * Fetches a specific loan by ID
 */
export const fetchLoanById = async (loanId: string): Promise<Loan | null> => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        client:client_id (
          id,
          full_name,
          phone,
          email
        ),
        sfd:sfd_id (
          id,
          name,
          logo_url
        )
      `)
      .eq('id', loanId)
      .single();

    if (error) throw error;
    return data as Loan;
  } catch (error) {
    console.error('Error fetching loan details:', error);
    return null;
  }
};

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
 * Fetches the amortization schedule for a loan
 */
export const getLoanSchedule = async (loanId: string) => {
  try {
    const response = await supabase.functions.invoke('loans-api/schedule', {
      method: 'GET',
      query: { loanId }
    });

    if (response.error) throw new Error(response.error.message);
    return response.data.schedule || [];
  } catch (error) {
    console.error('Error fetching loan schedule:', error);
    throw new Error('Failed to fetch loan payment schedule');
  }
};

/**
 * Calculates payment details for a potential loan
 */
export const calculateLoan = async (amount: number, interestRate: number, durationMonths: number, loanPlanId?: string) => {
  try {
    const response = await supabase.functions.invoke('loans-api/calculate', {
      method: 'POST',
      body: { amount, interestRate, durationMonths, loanPlanId }
    });

    if (response.error) throw new Error(response.error.message);
    return response.data;
  } catch (error) {
    console.error('Error calculating loan:', error);
    throw new Error('Failed to calculate loan details');
  }
};
