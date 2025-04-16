
import { supabase } from '@/integrations/supabase/client';
import { LoanStatus, LoanDetails } from '@/types/loans';

/**
 * Fetches loan details from the database
 */
export async function fetchLoanDetails(loanId: string | undefined): Promise<{
  loanDetails: LoanDetails | null;
  loanStatus: LoanStatus | null;
  error: string | null;
}> {
  try {
    if (!loanId) {
      return { loanDetails: null, loanStatus: null, error: null };
    }
    
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        id, 
        amount, 
        interest_rate, 
        duration_months, 
        monthly_payment,
        purpose,
        disbursed_at,
        status,
        next_payment_date,
        last_payment_date,
        sfd_id,
        client_id
      `)
      .eq('id', loanId)
      .single();
      
    if (error) throw error;
    
    if (!data) {
      return { loanDetails: null, loanStatus: null, error: 'Loan not found' };
    }
    
    // Process loan details
    const loanDetails: LoanDetails = {
      loanType: data.purpose.includes('Micro') ? 'Microcrédit' : 'Prêt standard',
      loanPurpose: data.purpose,
      totalAmount: data.amount,
      disbursalDate: new Date(data.disbursed_at || Date.now()).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      endDate: new Date(new Date(data.disbursed_at || Date.now()).setMonth(
        new Date(data.disbursed_at || Date.now()).getMonth() + data.duration_months
      )).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      interestRate: data.interest_rate,
      status: data.status,
      disbursed: !!data.disbursed_at,
      withdrawn: data.status === 'withdrawn'
    };
    
    // Get payment history
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });
      
    if (paymentsError) throw paymentsError;
    
    // Calculate loan status values
    const paidAmount = paymentsData?.reduce((total, payment) => total + payment.amount, 0) || 0;
    const totalAmount = data.amount + (data.amount * data.interest_rate / 100);
    const remainingAmount = totalAmount - paidAmount;
    const progress = Math.min(100, Math.round((paidAmount / totalAmount) * 100));
    
    const now = new Date();
    const nextPaymentDate = data.next_payment_date ? new Date(data.next_payment_date) : null;
    const lateFees = (nextPaymentDate && nextPaymentDate < now) ? data.monthly_payment * 0.05 : 0;
    
    // Format payment history
    const paymentHistory = paymentsData?.map((payment, index) => {
      let status: 'paid' | 'pending' | 'late';
      if (payment.status === 'completed') status = 'paid';
      else if (payment.status === 'late') status = 'late';
      else status = 'pending';
      
      return {
        id: index + 1,
        date: new Date(payment.payment_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        amount: payment.amount,
        status
      };
    }) || [];
    
    // Create loan status object
    const loanStatus: LoanStatus = {
      nextPaymentDue: nextPaymentDate ? nextPaymentDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : 'Non défini',
      paidAmount,
      totalAmount,
      remainingAmount,
      progress,
      lateFees,
      paymentHistory,
      disbursed: !!data.disbursed_at,
      withdrawn: data.status === 'withdrawn'
    };
    
    return { loanDetails, loanStatus, error: null };
  } catch (err: any) {
    console.error('Error fetching loan details:', err);
    return { loanDetails: null, loanStatus: null, error: err.message };
  }
}
