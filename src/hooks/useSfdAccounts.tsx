
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sfdAccountService } from '@/services/sfdAccountService';
import { SfdAccount, CreateTransferParams, SfdAccountTransfer } from '@/types/sfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useSfdAccounts(sfdId?: string) {
  const { activeSfdId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const effectiveSfdId = sfdId || activeSfdId;

  // Get all accounts for the SFD
  const {
    data: accounts = [],
    isLoading,
    error,
    refetch: refetchAccounts
  } = useQuery({
    queryKey: ['sfd-accounts', effectiveSfdId],
    queryFn: () => sfdAccountService.getSfdAccounts(effectiveSfdId || ''),
    enabled: !!effectiveSfdId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get transfer history
  const {
    data: transferHistory = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['sfd-transfers', effectiveSfdId],
    queryFn: () => sfdAccountService.getSfdTransferHistory(effectiveSfdId || ''),
    enabled: !!effectiveSfdId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Transfer funds between accounts
  const transferFunds = useMutation({
    mutationFn: (params: CreateTransferParams) => 
      sfdAccountService.transferBetweenAccounts(params),
    onSuccess: () => {
      // Refresh accounts and transfer history
      queryClient.invalidateQueries({ queryKey: ['sfd-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-transfers'] });
      
      toast({
        title: "Transfert réussi",
        description: "Le transfert de fonds entre les comptes a été effectué avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du transfert",
        variant: "destructive",
      });
    }
  });

  // Categorize accounts by type
  const operationAccount = accounts.find(account => account.account_type === 'operation');
  const repaymentAccount = accounts.find(account => account.account_type === 'remboursement');
  const savingsAccount = accounts.find(account => account.account_type === 'epargne');

  return {
    accounts,
    isLoading,
    error,
    transferHistory,
    isLoadingHistory,
    operationAccount,
    repaymentAccount,
    savingsAccount,
    transferFunds,
    refetchAccounts,
    refetchHistory
  };
}

// Also export the types for components that need them
export type { SfdAccount, SfdAccountTransfer, CreateTransferParams };
