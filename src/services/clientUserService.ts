
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
  },

  /**
   * Links a client to an existing user account by email
   * @param clientId The ID of the client
   * @param email Email of the user account to link with
   */
  linkToExistingAccount: async (clientId: string, email: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('link-client-user', {
        body: { clientId, email }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error linking to existing account:', error);
      throw error;
    }
  },

  /**
   * Ensures a client has a savings account
   * @param clientId The ID of the client
   * @param sfdId The ID of the SFD (optional)
   */
  ensureSavingsAccount: async (clientId: string, sfdId?: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('ensure-client-savings', {
        body: { clientId, sfdId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error ensuring savings account:', error);
      throw error;
    }
  },

  /**
   * Find user by email and link to client
   * @param clientId The ID of the client to link
   * @param email The email address to find
   */
  findAndLinkUserByEmail: async (clientId: string, email: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('find-link-user-by-email', {
        body: { clientId, email }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding and linking user:', error);
      throw error;
    }
  },
  
  /**
   * Synchronize client with user account and create savings account
   */
  syncClientWithUserAndCreateAccount: async (clientId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-client-user-account', {
        body: { clientId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error syncing client and creating account:', error);
      throw error;
    }
  }
};
