
import { supabase } from '@/integrations/supabase/client';
import { SyncResult } from './types';

/**
 * Synchronize accounts with the SFD backend
 * @param userId The user ID to synchronize accounts for
 * @param sfdId Optional SFD ID to synchronize specifically 
 * @returns Sync result with success status and updates
 */
export async function synchronizeAccounts(userId: string, sfdId?: string): Promise<SyncResult> {
  try {
    // Call the Edge Function to synchronize accounts
    const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
      body: { 
        userId,
        sfdId, 
        forceSync: true 
      }
    });
    
    if (error) throw error;
    
    // Return the result from the function
    return {
      success: data.success,
      message: data.message,
      updates: data.updates || []
    };
  } catch (error) {
    console.error('Error synchronizing accounts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to synchronize accounts',
      updates: []
    };
  }
}
