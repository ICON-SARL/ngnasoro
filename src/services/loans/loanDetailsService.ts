
import { supabase } from '@/integrations/supabase/client';
import { LoanStatus, LoanDetails } from '@/types/loans';

/**
 * Fetches comprehensive details for a loan
 */
export const fetchLoanDetails = async (loanId: string): Promise<{ 
  loanDetails?: LoanDetails,
  loanStatus?: LoanStatus,
  error?: string
}> => {
  try {
    // Fetch the basic loan info
    const { data: loan, error: loanError } = await supabase
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

    if (loanError) throw loanError;
    
    if (!loan) {
      return { error: 'Loan not found' };
    }
    
    // Fetch payment history
    const { data: payments, error: paymentsError } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });
      
    if (paymentsError) throw paymentsError;
    
    // Calculate total paid amount
    const paidAmount = payments ? payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
    
    // Calculate loan status data
    const loanStatus: LoanStatus = {
      totalAmount: loan.amount,
      paidAmount: paidAmount,
      remainingAmount: loan.amount - paidAmount,
      nextPaymentDue: loan.next_payment_date || '',
      paymentHistory: (payments || []).map(payment => ({
        id: payment.id,
        date: payment.payment_date,
        amount: payment.amount,
        status: payment.status
      })),
      status: loan.status,
      progress: Math.min(100, Math.round((paidAmount / loan.amount) * 100)),
      lateFees: 0, // This would be calculated based on business rules
      disbursed: !!loan.disbursed_at,
      withdrawn: false
    };
    
    // Format loan details
    const loanDetails: LoanDetails = {
      loanType: 'Standard', // This could be fetched from a loan_types table
      loanPurpose: loan.purpose,
      totalAmount: loan.amount,
      disbursalDate: loan.disbursed_at || '',
      endDate: loan.end_date || '',
      interestRate: loan.interest_rate,
      status: loan.status,
      disbursed: !!loan.disbursed_at,
      withdrawn: false
    };
    
    return {
      loanDetails,
      loanStatus
    };
  } catch (error: any) {
    console.error('Error fetching loan details:', error);
    return { error: error.message || 'Failed to fetch loan details' };
  }
};

/**
 * Fetch loan activities
 */
export const fetchLoanActivities = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('loan_activities')
      .select(`
        *,
        user:performed_by (
          id,
          email,
          app_metadata->>full_name
        )
      `)
      .eq('loan_id', loanId)
      .order('performed_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching loan activities:', error);
    throw new Error('Failed to fetch loan activities');
  }
};
