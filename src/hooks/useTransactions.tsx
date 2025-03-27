
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transactions';
import { createTransactionManager, TransactionParams } from '@/services/transactions/transactionManager';

export function useTransactions(userId?: string, sfdId?: string) {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Utiliser les valeurs depuis le contexte auth si non fournies
  const effectiveUserId = userId || user?.id;
  const effectiveSfdId = sfdId || activeSfdId || '';

  // Initialiser le gestionnaire de transactions
  const transactionManager = effectiveUserId && effectiveSfdId ? 
    createTransactionManager(effectiveUserId, effectiveSfdId) : null;

  // Récupérer les transactions
  const fetchTransactions = useCallback(async (limit: number = 10) => {
    if (!transactionManager) {
      setError('Utilisateur ou SFD non défini');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedTransactions = await transactionManager.getTransactionHistory(limit);
      setTransactions(fetchedTransactions);
      return fetchedTransactions;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des transactions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [transactionManager]);

  // Effectuer un dépôt
  const makeDeposit = useCallback(async (amount: number, description?: string, paymentMethod?: string) => {
    if (!transactionManager) {
      setError('Utilisateur ou SFD non défini');
      toast({
        title: 'Erreur',
        description: 'Impossible d\'effectuer le dépôt: utilisateur ou SFD non défini',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction = await transactionManager.makeDeposit(amount, description, paymentMethod);
      
      if (transaction) {
        toast({
          title: 'Dépôt réussi',
          description: `Vous avez déposé ${amount} FCFA dans votre compte`,
        });
        await fetchTransactions();
      } else {
        toast({
          title: 'Erreur',
          description: 'Le dépôt a échoué, veuillez réessayer',
          variant: 'destructive',
        });
      }
      
      return transaction;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du dépôt');
      toast({
        title: 'Erreur',
        description: err.message || 'Erreur lors du dépôt',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [transactionManager, toast, fetchTransactions]);

  // Effectuer un retrait
  const makeWithdrawal = useCallback(async (amount: number, description?: string, paymentMethod?: string) => {
    if (!transactionManager) {
      setError('Utilisateur ou SFD non défini');
      toast({
        title: 'Erreur',
        description: 'Impossible d\'effectuer le retrait: utilisateur ou SFD non défini',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction = await transactionManager.makeWithdrawal(amount, description, paymentMethod);
      
      if (transaction) {
        toast({
          title: 'Retrait réussi',
          description: `Vous avez retiré ${amount} FCFA de votre compte`,
        });
        await fetchTransactions();
      } else {
        toast({
          title: 'Erreur',
          description: 'Le retrait a échoué, veuillez réessayer',
          variant: 'destructive',
        });
      }
      
      return transaction;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du retrait');
      toast({
        title: 'Erreur',
        description: err.message || 'Erreur lors du retrait',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [transactionManager, toast, fetchTransactions]);

  // Effectuer un remboursement de prêt
  const makeLoanRepayment = useCallback(async (loanId: string, amount: number, description?: string, paymentMethod?: string) => {
    if (!transactionManager) {
      setError('Utilisateur ou SFD non défini');
      toast({
        title: 'Erreur',
        description: 'Impossible d\'effectuer le remboursement: utilisateur ou SFD non défini',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction = await transactionManager.makeLoanRepayment(loanId, amount, description, paymentMethod);
      
      if (transaction) {
        toast({
          title: 'Remboursement réussi',
          description: `Vous avez remboursé ${amount} FCFA sur votre prêt`,
        });
        await fetchTransactions();
      } else {
        toast({
          title: 'Erreur',
          description: 'Le remboursement a échoué, veuillez réessayer',
          variant: 'destructive',
        });
      }
      
      return transaction;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du remboursement');
      toast({
        title: 'Erreur',
        description: err.message || 'Erreur lors du remboursement',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [transactionManager, toast, fetchTransactions]);

  // Récupérer le solde actuel
  const getBalance = useCallback(async () => {
    if (!transactionManager) {
      setError('Utilisateur ou SFD non défini');
      return 0;
    }

    try {
      return await transactionManager.getAccountBalance();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération du solde');
      return 0;
    }
  }, [transactionManager]);

  // Charger les transactions au montage du composant
  useCallback(() => {
    if (effectiveUserId && effectiveSfdId) {
      fetchTransactions();
    }
  }, [effectiveUserId, effectiveSfdId, fetchTransactions]);

  return {
    isLoading,
    error,
    transactions,
    fetchTransactions,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment,
    getBalance
  };
}
