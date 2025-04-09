
import { SyncResult } from './types';

/**
 * Synchronizes accounts with SFD system
 */
export async function synchronizeAccounts(userId: string): Promise<SyncResult> {
  if (!userId) {
    throw new Error('Utilisateur non connecté');
  }
  
  // For test accounts, just simulate success
  if (userId.includes('test')) {
    return { success: true };
  }
  
  try {
    const { apiClient } = await import('@/utils/apiClient');
    await apiClient.callEdgeFunction('synchronize-sfd-accounts', {
      userId: userId
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to synchronize SFD accounts:', error);
    throw new Error('Échec de la synchronisation');
  }
}
