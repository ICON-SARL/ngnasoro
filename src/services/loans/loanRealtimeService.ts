
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
      'broadcast',
      { event: 'loan_status_update' },
      (payload) => {
        if (payload.payload) {
          const updatedStatus = payload.payload;
          onUpdate(updatedStatus);
        }
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}
