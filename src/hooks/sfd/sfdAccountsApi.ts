
// Define simple interfaces locally to avoid circular imports
interface SfdBalanceData {
  balance: number;
  currency: string;
}

interface SyncResult {
  success: boolean;
  message?: string;
}

// Import apiClient at the end to avoid circular imports
import { apiClient } from '@/utils/apiClient';

export async function fetchUserSfds(userId: string): Promise<any[]> {
  if (!userId) return [];
  
  try {
    // Check if this is a test user by email domain or test in userId
    if (userId.includes('test') || userId === 'client@test.com') {
      // Return predefined SFDs for test accounts
      return [
        {
          id: 'test-sfd1',
          is_default: false,
          sfds: {
            id: 'premier-sfd-id',
            name: 'Premier SFD',
            code: 'P',
            region: 'Centre',
            logo_url: null
          }
        },
        {
          id: 'test-sfd2',
          is_default: true,
          sfds: {
            id: 'deuxieme-sfd-id',
            name: 'Deuxième SFD',
            code: 'D',
            region: 'Nord',
            logo_url: null
          }
        },
        {
          id: 'test-sfd3',
          is_default: false,
          sfds: {
            id: 'troisieme-sfd-id',
            name: 'Troisième SFD',
            code: 'T',
            region: 'Sud',
            logo_url: null
          }
        }
      ];
    }
    
    // Normal path for non-test users
    const sfdsList = await apiClient.getUserSfds(userId);
    return sfdsList;
  } catch (error) {
    console.error('Error fetching SFDs:', error);
    return [];
  }
}

export async function fetchSfdBalance(userId: string, sfdId: string): Promise<SfdBalanceData> {
  try {
    // For test accounts, return 0 balance
    if (userId.includes('test') || sfdId.includes('test') || 
        ['premier-sfd-id', 'deuxieme-sfd-id', 'troisieme-sfd-id'].includes(sfdId)) {
      return { balance: 0, currency: 'FCFA' };
    }
    
    // First, try to get the balance from the accounts table
    const { data, error } = await apiClient.supabase
      .from('accounts')
      .select('balance, currency')
      .eq('user_id', userId)
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
    // For test accounts, return empty loans array
    if (userId.includes('test') || sfdId.includes('test') || 
        ['premier-sfd-id', 'deuxieme-sfd-id', 'troisieme-sfd-id'].includes(sfdId)) {
      return [];
    }
    
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
  
  // For test accounts, just simulate success
  if (userId.includes('test')) {
    return { success: true };
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
  params: {
    loanId: string;
    amount: number;
    method?: string;
  }
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

// Mobile money payments function
export async function processMobileMoneyPayment(
  userId: string,
  phoneNumber: string,
  amount: number,
  provider: string,
  isRepayment: boolean = false,
  loanId?: string
): Promise<SyncResult> {
  if (!userId) {
    throw new Error('Utilisateur non connecté');
  }
  
  try {
    const payload: any = {
      userId,
      phoneNumber,
      amount,
      provider,
      isRepayment
    };
    
    if (isRepayment && loanId) {
      payload.loanId = loanId;
    }
    
    const result = await apiClient.callEdgeFunction('mobile-money-payment', payload);
    
    if (!result || !result.success) {
      throw new Error(result?.error || 'Échec du paiement mobile money');
    }
    
    return { 
      success: true,
      message: 'Paiement mobile money initié avec succès'
    };
  } catch (error) {
    console.error('Failed to process mobile money payment:', error);
    throw new Error('Échec du paiement mobile money');
  }
}
