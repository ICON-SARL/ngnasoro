
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/transactions';

export function useBalanceManagement(userId?: string, activeSfdId?: string) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const { toast } = useToast();
  
  const { 
    getBalance,
    refetch,
    isLoading 
  } = useTransactions(userId, activeSfdId);
  
  const fetchBalance = useCallback(async () => {
    try {
      const balance = await getBalance();
      setCurrentBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le solde",
        variant: "destructive",
      });
      return 0;
    }
  }, [getBalance, toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      await fetchBalance();
      toast({
        title: "Mise à jour",
        description: "Données actualisées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    currentBalance,
    isRefreshing: isRefreshing || isLoading,
    fetchBalance,
    handleRefresh
  };
}
