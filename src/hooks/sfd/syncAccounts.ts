
import { supabase } from '@/integrations/supabase/client';
import { SyncResult } from './types';

export async function syncAccounts(userId: string, sfdId?: string): Promise<SyncResult> {
  try {
    const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
      body: { 
        userId, 
        sfdId, 
        forceFullSync: true 
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      success: true,
      message: 'Accounts synchronized successfully',
      syncedAccounts: data?.syncedAccounts || []
    };
  } catch (err: any) {
    console.error('Failed to synchronize accounts:', err);
    return {
      success: false,
      message: err.message || 'Failed to synchronize accounts',
      error: err
    };
  }
}
