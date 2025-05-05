
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SyncResult } from './types';

// Function to synchronize accounts with the SFD server
export async function syncWithSfd(userId?: string, sfdId?: string): Promise<SyncResult> {
  try {
    const { user } = useAuth();
    const effectiveUserId = userId || user?.id;
    
    if (!effectiveUserId) {
      return { 
        success: false, 
        message: 'Utilisateur non connecté' 
      };
    }
    
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
      body: { 
        userId: effectiveUserId,
        sfdId,
        forceFullSync: true
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      syncedAccounts: data?.accounts || [],
      message: data?.message || 'Comptes synchronisés avec succès'
    };
  } catch (error: any) {
    console.error('Error synchronizing with SFD:', error);
    return {
      success: false,
      error,
      message: error.message || 'Erreur de synchronisation avec la SFD'
    };
  }
}
