
import { supabase } from '@/integrations/supabase/client';
import { LoanStatus } from '@/types/loans';

/**
 * Sets up a realtime subscription for loan updates
 */
export const setupLoanRealtimeSubscription = (
  callback: (updatedStatus: Partial<LoanStatus>) => void
) => {
  // Subscribe to changes in the loan_payments table
  const channel = supabase
    .channel('loan-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'loan_payments'
      },
      (payload) => {
        // When a new payment is recorded, update the status
        const payment = payload.new;
        
        callback({
          paidAmount: (payment?.amount || 0) // In a real app, we'd need to recalculate the total
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sfd_loans'
      },
      (payload) => {
        // When the loan is updated
        const loan = payload.new;
        
        callback({
          status: loan?.status as any,
          nextPaymentDue: loan?.next_payment_date
        });
      }
    )
    .subscribe();
    
  // Return a cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};
