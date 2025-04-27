
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
    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ client_code: clientCode })
      .eq('id', userId);

    if (profileError) throw profileError;

    // If sfdId provided, update the client record too
    if (sfdId) {
      const { error: clientError } = await supabase
        .from('sfd_clients')
        .update({ client_code: clientCode })
        .eq('user_id', userId)
        .eq('sfd_id', sfdId);

      if (clientError) throw clientError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error synchronizing client code:', error);
    return { success: false, error: error.message };
  }
};
