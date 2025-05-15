
import { useState, useEffect, useCallback } from 'react';
import { 
  setupLoanRealtimeSubscription, 
  setupLoanPaymentSubscription,
  setupLoanActivitySubscription 
} from '@/services/loans/loanRealtimeService';
import { LoanStatus } from '@/types/loans';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook for subscribing to realtime loan updates
 * @param loanId - Optional loan ID to filter updates for a specific loan
 * @returns Object containing subscription state and latest updates
 */
export function useLoanRealtime(loanId?: string) {
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [loanStatus, setLoanStatus] = useState<Partial<LoanStatus> | null>(null);
  const [latestPayment, setLatestPayment] = useState<any | null>(null);
  const [latestActivity, setLatestActivity] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handle loan status updates
  const handleStatusUpdate = useCallback((updatedStatus: Partial<LoanStatus>) => {
    console.log("Loan status update received:", updatedStatus);
    setLoanStatus(prev => ({ ...prev, ...updatedStatus }));
    
    // Show toast notification for important status changes
    if (updatedStatus.status === 'approved') {
      toast({
        title: 'Prêt approuvé',
        description: 'La demande de prêt a été approuvée',
      });
    } else if (updatedStatus.status === 'rejected') {
      toast({
        title: 'Prêt rejeté',
        description: 'La demande de prêt a été rejetée',
        variant: 'destructive',
      });
    } else if (updatedStatus.disbursement_status === 'completed') {
      toast({
        title: 'Fonds décaissés',
        description: 'Les fonds du prêt ont été décaissés',
      });
    }
  }, [toast]);

  // Handle payment updates
  const handlePaymentUpdate = useCallback((payment: any) => {
    console.log("New loan payment received:", payment);
    setLatestPayment(payment);
    toast({
      title: 'Nouveau paiement enregistré',
      description: `Un paiement de ${payment.amount.toLocaleString()} FCFA a été enregistré`,
    });
  }, [toast]);

  // Handle activity updates
  const handleActivityUpdate = useCallback((activity: any) => {
    console.log("New loan activity received:", activity);
    setLatestActivity(activity);
  }, []);

  // Set up subscriptions
  useEffect(() => {
    if (!activeSfdId) {
      console.log("No active SFD ID available for realtime subscription");
      return;
    }
    
    console.log(`Setting up loan realtime subscription for SFD: ${activeSfdId}, loan: ${loanId || 'all loans'}`);
    setIsConnected(true);
    
    // Set up loan status subscription
    const statusCleanup = setupLoanRealtimeSubscription(handleStatusUpdate, loanId);
    
    // Set up loan payment subscription if we have a loanId
    let paymentCleanup = () => {};
    let activityCleanup = () => {};
    
    if (loanId) {
      paymentCleanup = setupLoanPaymentSubscription(loanId, handlePaymentUpdate);
      activityCleanup = setupLoanActivitySubscription(loanId, handleActivityUpdate);
    }
    
    // Cleanup function
    return () => {
      console.log("Cleaning up loan realtime subscriptions");
      statusCleanup();
      paymentCleanup();
      activityCleanup();
      setIsConnected(false);
    };
  }, [activeSfdId, loanId, handleStatusUpdate, handlePaymentUpdate, handleActivityUpdate]);

  return {
    loanStatus,
    latestPayment,
    latestActivity,
    isConnected
  };
}
