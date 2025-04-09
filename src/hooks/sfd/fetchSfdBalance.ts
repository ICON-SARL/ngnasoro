
import { SfdBalanceData } from './types';

/**
 * Fetches balance for a specific SFD account
 */
export async function fetchSfdBalance(userId: string, sfdId: string): Promise<SfdBalanceData> {
  try {
    // For test accounts, return 0 balance
    if (userId.includes('test') || sfdId.includes('test') || 
        ['premier-sfd-id', 'deuxieme-sfd-id', 'troisieme-sfd-id'].includes(sfdId)) {
      return { balance: 0, currency: 'FCFA' };
    }
    
    const { apiClient } = await import('@/utils/apiClient');
    
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
