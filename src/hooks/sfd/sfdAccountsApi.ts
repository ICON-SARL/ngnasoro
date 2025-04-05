
import { apiClient } from '@/utils/apiClient';

// Use primitive types instead of importing User
// This breaks the circular dependency
export async function fetchUserSfds(userId: string): Promise<UserSfd[]> {
  if (!userId) return [];
  
  const sfdsList = await apiClient.getUserSfds(userId);
  return sfdsList;
}

export async function fetchSfdBalance(userId: string, sfdId: string): Promise<SfdBalanceData> {
  try {
    // First, try to get the balance from the accounts table
    const { data, error } = await apiClient.supabase
      .from('accounts')
      .select('balance, currency')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();
      
    if (error) {
      console.error(`Error fetching balance from database: ${error.message}`);
      // Fall back to the API client
      return await apiClient.getSfdBalance(userId, sfdId);
    }
    
    if (data) {
      return { 
        balance: data.balance || 0, 
        currency: data.currency || 'FCFA' 
      };
    } else {
      // If no record found, use the API client
      return await apiClient.getSfdBalance(userId, sfdId);
    }
  } catch (error) {
    console.error(`Failed to fetch balance for SFD ${sfdId}:`, error);
    return { balance: 0, currency: 'FCFA' };
  }
}

export async function fetchSfdLoans(userId: string, sfdId: string) {
  try {
    const loansData = await apiClient.getSfdLoans(userId, sfdId);
    return loansData;
  } catch (error) {
    console.error('Failed to fetch SFD loans:', error);
    return [];
  }
}

export async function synchronizeAccounts(userId: string): Promise<SyncResult> {
  if (!userId) {
    throw new Error('Utilisateur non connecté');
  }
  
  try {
    await apiClient.callEdgeFunction('synchronize-sfd-accounts', {
      userId: userId
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to synchronize SFD accounts:', error);
    throw new Error('Échec de la synchronisation');
  }
}

export async function processLoanPayment(
  userId: string, 
  activeSfdId: string, 
  params: LoanPaymentParams
): Promise<SyncResult> {
  if (!userId || !activeSfdId) {
    throw new Error('User or active SFD not set');
  }
  
  // Add a transaction record
  await apiClient.callEdgeFunction('process-repayment', {
    userId: userId,
    sfdId: activeSfdId,
    loanId: params.loanId,
    amount: params.amount
  });
  
  return { success: true };
}

// Import types after function declarations to avoid circular references
import type { SfdBalanceData, UserSfd, SyncResult, LoanPaymentParams } from './types';
