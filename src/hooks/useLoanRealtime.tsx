
import { useState, useEffect, useCallback } from 'react';
import { 
  setupLoanRealtimeSubscription, 
  setupLoanPaymentSubscription,
  setupLoanActivitySubscription 
} from '@/services/loans/loanRealtimeService';
import { LoanStatus } from '@/types/loans';
import { useToast } from '@/hooks/use-toast';

export function useLoanRealtime(loanId?: string) {
  const { toast } = useToast();
  const [loanStatus, setLoanStatus] = useState<Partial<LoanStatus> | null>(null);
  const [latestPayment, setLatestPayment] = useState<any | null>(null);
  const [latestActivity, setLatestActivity] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handle loan status updates
  const handleStatusUpdate = useCallback((updatedStatus: Partial<LoanStatus>) => {
    setLoanStatus(prev => ({ ...prev, ...updatedStatus }));
    
    // Show toast notification for important status changes
    if (updatedStatus.status === 'approved') {
      toast({
        title: 'Prêt approuvé',
        description: 'Votre demande de prêt a été approuvée',
      });
    } else if (updatedStatus.status === 'rejected') {
      toast({
        title: 'Prêt rejeté',
        description: 'Votre demande de prêt a été rejetée',
        variant: 'destructive',
      });
    } else if (updatedStatus.disbursement_status === 'completed') {
      toast({
        title: 'Fonds décaissés',
        description: 'Les fonds de votre prêt ont été décaissés',
      });
    }
  }, [toast]);

  // Handle payment updates
  const handlePaymentUpdate = useCallback((payment: any) => {
    setLatestPayment(payment);
    toast({
      title: 'Nouveau paiement enregistré',
      description: `Un paiement de ${payment.amount.toLocaleString()} FCFA a été enregistré`,
    });
  }, [toast]);

  // Handle activity updates
  const handleActivityUpdate = useCallback((activity: any) => {
    setLatestActivity(activity);
  }, []);

  // Set up subscriptions
  useEffect(() => {
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
      statusCleanup();
      paymentCleanup();
      activityCleanup();
      setIsConnected(false);
    };
  }, [loanId, handleStatusUpdate, handlePaymentUpdate, handleActivityUpdate]);

  return {
    loanStatus,
    latestPayment,
    latestActivity,
    isConnected
  };
}
