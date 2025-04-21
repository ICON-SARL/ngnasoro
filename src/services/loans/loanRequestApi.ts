
import { supabase } from "@/integrations/supabase/client";
import { Loan } from "@/types/sfdClients";

export const loanRequestApi = {
  /**
   * Get loan request with enhanced status tracking
   */
  async getLoanRequestStatus(loanId: string): Promise<{
    loan: Loan | null;
    activities: any[];
    nextPayment?: {
      date: string;
      amount: number;
    };
  }> {
    try {
      // Get loan details with related data
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          loan_activities (
            activity_type,
            description,
            performed_at
          ),
          loan_payments (
            amount,
            payment_date,
            status
          )
        `)
        .eq('id', loanId)
        .single();

      if (loanError) throw loanError;
      
      // Cast the loan data to ensure it conforms to the Loan type
      const typedLoan: Loan = {
        ...loan,
        status: loan.status || 'pending'
      };

      // Get activities in chronological order
      const { data: activities } = await supabase
        .from('loan_activities')
        .select('*')
        .eq('loan_id', loanId)
        .order('performed_at', { ascending: true });

      return {
        loan: typedLoan,
        activities: activities || [],
        nextPayment: typedLoan.next_payment_date ? {
          date: typedLoan.next_payment_date,
          amount: typedLoan.monthly_payment
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching loan request status:', error);
      return { loan: null, activities: [] };
    }
  },

  /**
   * Get all pending payments and upcoming due dates
   */
  async getLoanPaymentSchedule(loanId: string) {
    try {
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (loanError) throw loanError;

      const { data: payments } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: true });

      // Calculate remaining payments
      const totalPayments = loan.duration_months;
      const madePayments = payments?.length || 0;
      const remainingPayments = totalPayments - madePayments;

      return {
        totalPayments,
        madePayments,
        remainingPayments,
        nextPaymentDate: loan.next_payment_date,
        monthlyPayment: loan.monthly_payment,
        payments: payments || []
      };
    } catch (error) {
      console.error('Error fetching loan payment schedule:', error);
      return null;
    }
  },

  /**
   * Subscribe to loan status updates
   */
  subscribeToLoanUpdates(loanId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`loan-${loanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sfd_loans',
          filter: `id=eq.${loanId}`
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};
