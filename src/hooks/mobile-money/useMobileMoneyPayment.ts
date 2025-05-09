
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/transactions';
import { useAuth } from '@/hooks/useAuth';

export function useMobileMoneyPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createTransaction } = useTransactions();

  const processPayment = async ({
    amount,
    phoneNumber,
    provider,
    description,
    loanId
  }: {
    amount: number;
    phoneNumber: string;
    provider: string;
    description?: string;
    loanId?: string;
  }) => {
    setIsProcessing(true);
    setError(null);

    try {
      const transactionType = loanId ? 'loan_repayment' : 'deposit';
      const transactionDescription = description || 
        (loanId ? `Remboursement de prêt par Mobile Money` : `Dépôt par Mobile Money`);
      
      await createTransaction({
        amount,
        type: transactionType,
        description: transactionDescription,
        name: loanId ? 'Remboursement prêt' : 'Dépôt Mobile Money',
        paymentMethod: `mobile_money_${provider.toLowerCase()}`,
        referenceId: loanId
      });
      
      toast({
        title: "Paiement initié",
        description: "Vous recevrez un SMS pour confirmer votre transaction.",
      });
      
      return true;
    } catch (err) {
      console.error('Mobile money payment error:', err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors du traitement du paiement");
      
      toast({
        title: "Échec du paiement",
        description: "Le paiement n'a pas pu être traité. Veuillez réessayer.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, error, processPayment };
}
