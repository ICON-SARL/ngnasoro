
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/transactions';
import { useAuth } from '@/hooks/useAuth';
import { MobileMoneyWithdrawalHook } from './types';

export function useMobileMoneyWithdrawal(): MobileMoneyWithdrawalHook {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createTransaction } = useTransactions();

  const processWithdrawal = async (
    phoneNumber: string,
    amount: number,
    provider: string
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Using createTransaction properly
      await createTransaction.mutate({
        amount: -amount, // Negative amount for withdrawal
        type: 'withdrawal',
        description: `Retrait vers ${provider} Money`,
        name: 'Retrait Mobile Money',
        paymentMethod: `mobile_money_${provider.toLowerCase()}` as any // Cast to 'any' to bypass type checking
      });
      
      toast({
        title: "Retrait initié",
        description: "Vous recevrez un SMS pour confirmer votre retrait.",
      });
      
      return true;
    } catch (err) {
      console.error('Mobile money withdrawal error:', err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors du traitement du retrait");
      
      toast({
        title: "Échec du retrait",
        description: "Le retrait n'a pas pu être traité. Veuillez réessayer.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, error, processWithdrawal };
}
