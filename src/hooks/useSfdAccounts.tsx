
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SfdAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  logoUrl?: string;
  region?: string;
  code?: string;
  isDefault?: boolean;
  loans?: {
    id: string;
    amount: number;
    remainingAmount: number;
    nextDueDate: string;
    isLate: boolean;
  }[];
}

export function useSfdAccounts() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user's SFDs list
  const sfdsQuery = useQuery({
    queryKey: ['user-sfds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const sfdsList = await apiClient.getUserSfds(user.id);
      
      if (sfdsList.length === 0) {
        console.log('User has no SFD accounts');
        return [];
      }
      
      // Transform the data format
      return Promise.all(sfdsList.map(async (sfd) => {
        try {
          const balanceData = await apiClient.getSfdBalance(user.id, sfd.sfds.id);
          return {
            id: sfd.sfds.id,
            name: sfd.sfds.name,
            logoUrl: sfd.sfds.logo_url,
            region: sfd.sfds.region,
            code: sfd.sfds.code,
            isDefault: sfd.is_default,
            balance: balanceData.balance,
            currency: balanceData.currency
          };
        } catch (error) {
          console.error(`Failed to fetch balance for SFD ${sfd.sfds.name}:`, error);
          // Return account with zero balance in case of error
          return {
            id: sfd.sfds.id,
            name: sfd.sfds.name,
            logoUrl: sfd.sfds.logo_url,
            region: sfd.sfds.region,
            code: sfd.sfds.code,
            isDefault: sfd.is_default,
            balance: 0,
            currency: 'FCFA'
          };
        }
      }));
    },
    enabled: !!user?.id,
  });
  
  // Fetch the active SFD account details
  const activeSfdQuery = useQuery({
    queryKey: ['active-sfd', user?.id, activeSfdId],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return null;
      
      // Get basic SFD info
      const sfdsList = await apiClient.getUserSfds(user.id);
      const activeSfd = sfdsList.find(sfd => sfd.sfds.id === activeSfdId);
      
      if (!activeSfd) {
        console.error('Active SFD not found for this user');
        return null;
      }
      
      try {
        // Get balance data
        const balanceData = await apiClient.getSfdBalance(user.id, activeSfdId);
        
        // Get loans data
        const loansData = await apiClient.getSfdLoans(user.id, activeSfdId);
        
        return {
          id: activeSfd.sfds.id,
          name: activeSfd.sfds.name,
          logoUrl: activeSfd.sfds.logo_url,
          region: activeSfd.sfds.region,
          code: activeSfd.sfds.code,
          isDefault: activeSfd.is_default,
          balance: balanceData.balance,
          currency: balanceData.currency,
          loans: loansData
        };
      } catch (error) {
        console.error('Failed to fetch SFD account details:', error);
        toast({
          title: 'Erreur de synchronisation',
          description: 'Impossible de synchroniser les données avec votre SFD',
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!user?.id && !!activeSfdId,
  });
  
  // Synchronize account balances from SFD
  const synchronizeBalances = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      
      // In a real app, this would call an API to sync balances from SFD systems
      try {
        await apiClient.callEdgeFunction('synchronize-sfd-accounts', {
          userId: user.id
        });
        return { success: true };
      } catch (error) {
        console.error('Failed to synchronize SFD accounts:', error);
        throw new Error('Échec de la synchronisation');
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user-sfds'] });
      queryClient.invalidateQueries({ queryKey: ['active-sfd'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      
      toast({
        title: 'Synchronisation réussie',
        description: 'Vos soldes ont été mis à jour avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de synchronisation',
        description: error.message || 'Une erreur est survenue lors de la synchronisation',
        variant: 'destructive',
      });
    }
  });
  
  // Make a payment on a loan
  const makeLoanPayment = useMutation({
    mutationFn: async ({ loanId, amount }: { loanId: string; amount: number }) => {
      if (!user?.id || !activeSfdId) {
        throw new Error('User or active SFD not set');
      }
      
      // Add a transaction record
      await apiClient.callEdgeFunction('process-repayment', {
        userId: user.id,
        sfdId: activeSfdId,
        loanId,
        amount
      });
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['active-sfd'] });
      queryClient.invalidateQueries({ queryKey: ['user-sfds'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      
      toast({
        title: 'Paiement effectué',
        description: 'Votre paiement a été traité avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de paiement',
        description: error.message || 'Une erreur est survenue lors du paiement',
        variant: 'destructive',
      });
    }
  });
  
  return {
    sfdAccounts: sfdsQuery.data || [],
    activeSfdAccount: activeSfdQuery.data,
    isLoading: sfdsQuery.isLoading || activeSfdQuery.isLoading,
    isError: sfdsQuery.isError || activeSfdQuery.isError,
    makeLoanPayment,
    synchronizeBalances,
    refetch: () => {
      sfdsQuery.refetch();
      activeSfdQuery.refetch();
    }
  };
}
