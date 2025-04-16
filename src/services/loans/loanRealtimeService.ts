
import { supabase } from '@/integrations/supabase/client';
import { LoanStatus } from '@/types/loans';

type LoanUpdateCallback = (updatedStatus: Partial<LoanStatus>) => void;

/**
 * Sets up a realtime subscription for loan status changes
 */
export function setupLoanRealtimeSubscription(onUpdate: LoanUpdateCallback) {
  const channel = supabase
    .channel('loan-status-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sfd_loans'
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as Partial<LoanStatus>);
        }
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Setup broadcast channel for loan status notifications
 * This is useful for coordinating between multiple tabs
 */
export function setupLoanBroadcastChannel() {
  const channel = supabase.channel('loan-broadcast');
  
  const broadcastLoanUpdate = (loanId: string, status: string) => {
    channel.send({
      type: 'broadcast',
      event: 'loan_status_update',
      payload: { loanId, status, timestamp: new Date().toISOString() }
    });
  };
  
  channel.subscribe();
  
  return {
    broadcastLoanUpdate,
    cleanup: () => supabase.removeChannel(channel)
  };
}
