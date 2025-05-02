import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sfdAccountService } from '@/services/sfdAccountService';
import { SfdAccount as DbSfdAccount, CreateTransferParams, SfdAccountTransfer } from '@/types/sfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SfdClientAccount } from '@/hooks/sfd/types';

export interface SfdLoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}

export function useSfdAccounts(sfdId?: string) {
  const { activeSfdId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const effectiveSfdId = sfdId || activeSfdId;

  // Get all accounts for the SFD - make sure effectiveSfdId is not empty
  const {
    data: accounts = [],
    isLoading,
    error,
    refetch: refetchAccounts
  } = useQuery({
    queryKey: ['sfd-accounts', effectiveSfdId],
    queryFn: () => {
      // Check if we have a valid SFD ID before making the query
      if (!effectiveSfdId) {
        console.warn('No active SFD ID available, skipping accounts query');
        return Promise.resolve([]);
      }
      return sfdAccountService.getSfdAccounts(effectiveSfdId);
    },
    enabled: !!user && !!effectiveSfdId && effectiveSfdId !== '', // Only run if we have both user and valid SFD ID
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get transfer history - make sure effectiveSfdId is not empty
  const {
    data: transferHistory = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['sfd-transfers', effectiveSfdId],
    queryFn: () => {
      // Check if we have a valid SFD ID before making the query
      if (!effectiveSfdId) {
        console.warn('No active SFD ID available, skipping transfers query');
        return Promise.resolve([]);
      }
      return sfdAccountService.getSfdTransferHistory(effectiveSfdId);
    },
    enabled: !!user && !!effectiveSfdId && effectiveSfdId !== '', // Only run if we have both user and valid SFD ID
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add refetchSavingsAccount as an alias to refetchAccounts
  const refetchSavingsAccount = useCallback(() => {
    return refetchAccounts();
  }, [refetchAccounts]);

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

  // Make loan payment mutation
  const makeLoanPayment = useMutation({
    mutationFn: async (params: SfdLoanPaymentParams) => {
      // This is a placeholder as we haven't implemented the full loan payment functionality yet
      toast({
        title: "Paiement effectué",
        description: `Paiement de ${params.amount} FCFA pour le prêt #${params.loanId}`,
      });
      return { success: true };
    }
  });

  // Synchronize balances mutation
  const synchronizeBalances = useMutation({
    mutationFn: async () => {
      // Placeholder for balance synchronization
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refetchAccounts();
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Synchronisation réussie",
        description: "Les soldes de vos comptes ont été mis à jour",
      });
    }
  });

  // Categorize accounts by type
  const operationAccount = accounts.find(account => account.account_type === 'operation');
  const repaymentAccount = accounts.find(account => account.account_type === 'remboursement');
  const savingsAccount = accounts.find(account => account.account_type === 'epargne');

  // Make sure all required fields are present when transforming accounts
  const transformAccounts = (accounts: DbSfdAccount[]): SfdClientAccount[] => {
    return accounts.map(acc => ({
      id: acc.id,
      name: acc.description || `Compte ${acc.account_type}`,
      logoUrl: null,
      code: '',
      region: '',
      balance: acc.balance,
      currency: acc.currency,
      isDefault: false,
      isVerified: true,
      status: acc.status,
      sfd_id: acc.sfd_id,
      account_type: acc.account_type,
      description: acc.description, // Add description to fix the type error
      created_at: acc.created_at,
      updated_at: acc.updated_at
    }));
  };

  // Get transformed accounts as client accounts
  const sfdAccounts = transformAccounts(accounts);

  // Compute the active SFD account for UI components that expect it
  const activeSfdAccount = accounts.length > 0 && effectiveSfdId ? {
    id: effectiveSfdId,
    name: 'SFD Account',
    logoUrl: null,
    balance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
    currency: accounts[0]?.currency || 'FCFA',
    isDefault: true,
    isVerified: true,
    loans: [],
    status: 'active',
    sfd_id: effectiveSfdId,
    account_type: '',
    description: null,
    created_at: '',
    updated_at: ''
  } as SfdClientAccount : null;

  // Return both the original accounts and transformed accounts for compatibility
  return {
    accounts,
    sfdAccounts,
    isLoading,
    error,
    transferHistory,
    isLoadingHistory,
    operationAccount,
    repaymentAccount,
    savingsAccount,
    transferFunds,
    refetchAccounts,
    refetchHistory,
    refetch: refetchAccounts,
    synchronizeBalances,
    activeSfdAccount,
    makeLoanPayment,
    refetchSavingsAccount  // Add the alias here
  };
}

// Also export the types for components that need them
export type { DbSfdAccount, SfdAccountTransfer, CreateTransferParams };
export type { SfdClientAccount };
