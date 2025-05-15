
import { supabase } from '@/integrations/supabase/client';
import { LoanStatus } from '@/types/loans';

type LoanUpdateCallback = (updatedStatus: Partial<LoanStatus>) => void;

/**
 * Sets up a realtime subscription for loan status changes in the database
 */
export function setupLoanRealtimeSubscription(onUpdate: LoanUpdateCallback, loanId?: string) {
  console.log('Setting up loan realtime subscription', loanId ? `for loan: ${loanId}` : 'for all loans');
  
  // Create channel for loan status changes
  const channel = supabase
    .channel('loan-status-changes')
    .on(
      'postgres_changes',
      {
        event: '*',  // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'sfd_loans',
        filter: loanId ? `id=eq.${loanId}` : undefined
      },
      (payload) => {
        console.log('Received loan status update:', payload);
        if (payload.new) {
          const updatedLoan = payload.new as any;
          // Extract relevant loan status information
          const statusUpdate: Partial<LoanStatus> = {
            status: updatedLoan.status,
            disbursement_status: updatedLoan.disbursement_status,
            next_payment_date: updatedLoan.next_payment_date,
            last_payment_date: updatedLoan.last_payment_date,
          };
          onUpdate(statusUpdate);
        }
      }
    )
    .subscribe((status) => {
      console.log('Loan subscription status:', status);
    });

  // Return cleanup function
  return () => {
    console.log('Cleaning up loan realtime subscription');
    supabase.removeChannel(channel);
  };
}

/**
 * Sets up a realtime subscription for loan payment changes
 */
export function setupLoanPaymentSubscription(loanId: string, onPaymentUpdate: (payment: any) => void) {
  console.log('Setting up loan payment subscription for loan:', loanId);
  
  const channel = supabase
    .channel('loan-payment-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'loan_payments',
        filter: `loan_id=eq.${loanId}`
      },
      (payload) => {
        console.log('Received new loan payment:', payload);
        if (payload.new) {
          onPaymentUpdate(payload.new);
        }
      }
    )
    .subscribe((status) => {
      console.log('Loan payment subscription status:', status);
    });

  // Return cleanup function
  return () => {
    console.log('Cleaning up loan payment subscription');
    supabase.removeChannel(channel);
  };
}

/**
 * Sets up a realtime subscription for loan activity updates
 */
export function setupLoanActivitySubscription(loanId: string, onActivityUpdate: (activity: any) => void) {
  console.log('Setting up loan activity subscription for loan:', loanId);
  
  const channel = supabase
    .channel('loan-activity-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'loan_activities',
        filter: `loan_id=eq.${loanId}`
      },
      (payload) => {
        console.log('Received new loan activity:', payload);
        if (payload.new) {
          onActivityUpdate(payload.new);
        }
      }
    )
    .subscribe((status) => {
      console.log('Loan activity subscription status:', status);
    });

  // Return cleanup function
  return () => {
    console.log('Cleaning up loan activity subscription');
    supabase.removeChannel(channel);
  };
}
