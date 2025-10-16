
/**
 * Functions for synchronizing client codes across different tables
 */
import { supabase } from '@/integrations/supabase/client';

export const synchronizeClientCode = async (
  userId: string, 
  clientCode: string, 
  sfdId?: string
) => {
  try {
    // profiles and sfd_clients tables don't have client_code column
    console.warn('synchronizeClientCode: client_code column does not exist');
    return { success: false, error: 'client_code column does not exist' };
  } catch (error: any) {
    console.error('Error synchronizing client code:', error);
    return { success: false, error: error.message };
  }
};
