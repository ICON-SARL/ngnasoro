
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoanStatus, LoanDetails } from '@/types/loans';
import { fetchLoanDetails } from '@/services/loans/loanDetailsService';
import { setupLoanRealtimeSubscription } from '@/services/loans/loanRealtimeService';

export function useLoanDetails(loanId: string | undefined) {
  const { toast } = useToast();
  
  const [loanStatus, setLoanStatus] = useState<LoanStatus>({
    nextPaymentDue: '10 Juillet 2023',
    paidAmount: 10.40,
    totalAmount: 25.40,
    remainingAmount: 15.00,
    progress: 40,
    lateFees: 0,
    paymentHistory: [
      { id: 1, date: '05 August 2023', amount: 3.50, status: 'paid' },
      { id: 2, date: '05 July 2023', amount: 3.50, status: 'paid' },
      { id: 3, date: '05 June 2023', amount: 3.50, status: 'paid' }
    ],
    disbursed: true,
    withdrawn: false
  });
  
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    loanType: "Microcrédit",
    loanPurpose: "Achat de matériel",
    totalAmount: 25.40,
    disbursalDate: "5 janvier 2023",
    endDate: "5 juillet 2023",
    interestRate: 2.5,
    status: "actif",
    disbursed: true,
    withdrawn: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoanData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!loanId) {
        setIsLoading(false);
        return;
      }
      
      const result = await fetchLoanDetails(loanId);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails du prêt",
          variant: "destructive",
        });
        return;
      }
      
      if (result.loanDetails) {
        setLoanDetails(result.loanDetails);
      }
      
      if (result.loanStatus) {
        setLoanStatus(result.loanStatus);
      }
    } catch (err: any) {
      console.error('Error in useLoanDetails hook:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails du prêt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
    
    // Set up realtime subscription
    const cleanupSubscription = setupLoanRealtimeSubscription((updatedStatus) => {
      setLoanStatus(prevStatus => ({
        ...prevStatus,
        ...updatedStatus
      }));
      
      if (updatedStatus.lateFees && updatedStatus.lateFees > 0) {
        toast({
          title: "Frais de retard appliqués",
          description: `Des frais de retard de ${updatedStatus.lateFees} FCFA ont été appliqués à votre prêt`,
          variant: "destructive",
        });
      }
    });
    
    return cleanupSubscription;
  }, [loanId, toast]);

  return {
    loanStatus,
    loanDetails,
    isLoading,
    error,
    refetch: fetchLoanData
  };
}
