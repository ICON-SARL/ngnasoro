
import { supabase } from '@/integrations/supabase/client';

export const clientUserService = {
  /**
   * Creates a user account for a client
   * @param clientId The ID of the client
   */
  createUserAccount: async (clientId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: { clientId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  }
};
