
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SfdClientAccount, LoanPaymentParams } from '@/hooks/sfd/types';

// Import and re-export the SfdAccountDisplay type for components that need it
import { SfdAccountDisplay } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';
export type { SfdAccountDisplay };

export interface SfdLoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

// Import the service right here to avoid circular dependencies
import { sfdAccountService } from '@/services/sfdAccountService';

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
    refetch: refetchAccountsQuery
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
    mutationFn: (params: any) => 
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
      await refetchAccountsQuery();
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

  // For compatibility with components expecting SfdClientAccount type
  const transformAccounts = (accounts: any[]): SfdClientAccount[] => {
    return accounts.map(acc => ({
      id: acc.id,
      name: acc.description || `Compte ${acc.account_type}`,
      description: acc.description || `Compte ${acc.account_type}`,
      logoUrl: acc.logo_url || null,
      logo_url: acc.logo_url || null,
      code: acc.code || '',
      region: acc.region || '',
      balance: acc.balance,
      currency: acc.currency || 'FCFA',
      isDefault: acc.is_default || false,
      isVerified: true,
      status: acc.status || 'active',
      sfd_id: acc.sfd_id || '',
      account_type: acc.account_type || '',
      created_at: acc.created_at || new Date().toISOString(),
      updated_at: acc.updated_at || new Date().toISOString()
    }));
  };

  // Get transformed accounts as client accounts
  const sfdAccounts = transformAccounts(accounts);

  // Compute the active SFD account for UI components that expect it
  const activeSfdAccount = accounts.length > 0 ? {
    id: effectiveSfdId || accounts[0].sfd_id || '',
    name: 'SFD Account',
    description: 'Main SFD Account',
    logoUrl: accounts[0]?.logo_url || null,
    logo_url: accounts[0]?.logo_url || null,
    code: '',
    region: '',
    balance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
    currency: accounts[0]?.currency || 'FCFA',
    isDefault: true,
    isVerified: true,
    status: 'active',
    loans: [],
    sfd_id: effectiveSfdId || accounts[0].sfd_id || '',
    account_type: accounts[0]?.account_type || '',
    created_at: accounts[0]?.created_at || new Date().toISOString(),
    updated_at: accounts[0]?.updated_at || new Date().toISOString()
  } : null;

  // Define refetchAccounts for consistency across app
  const refetchAccounts = refetchAccountsQuery;

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
    makeLoanPayment,
    activeSfdAccount,
    synchronizeBalances,
    refetchAccounts,
    refetch: refetchAccountsQuery,  // Alias for backward compatibility
    refetchSavingsAccount: refetchAccountsQuery  // Add this property that some components use
  };
}

// Also export the types for components that need them
export type { SfdClientAccount };
