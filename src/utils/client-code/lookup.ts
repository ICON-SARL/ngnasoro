
import { supabase } from '@/integrations/supabase/client';

export interface ClientLookupResult {
  exists?: boolean;
  full_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  user_id?: string;
  client_code?: string;
  sfd_id?: string;
  client_id?: string;
  is_new_client?: boolean;
}

/**
 * Look up a user by client code
 */
export const lookupUserByClientCode = async (clientCode: string, sfdId?: string): Promise<ClientLookupResult | null> => {
  try {
    // First try to find in sfd_clients table
    const { data: clientData, error: clientError } = await getSfdClientByCode(clientCode, sfdId);
    
    if (clientData) {
      return clientData;
    }
    
    // Profiles table doesn't have email or client_code columns
    // Return null if not found in sfd_clients
    return null;
    
    return null;
  } catch (error) {
    console.error('Error in lookupUserByClientCode:', error);
    return null;
  }
};

/**
 * Get SFD client by code
 */
export const getSfdClientByCode = async (clientCode: string, sfdId?: string): Promise<{ data: ClientLookupResult | null, error: any }> => {
  try {
    // RPC function doesn't exist, use direct query instead
    // Note: sfd_clients table doesn't have client_code column
    // This function needs to be refactored or removed
    console.warn('getSfdClientByCode: client_code column does not exist in sfd_clients table');
    return { data: null, error: null };
  } catch (error) {
    console.error('Error in getSfdClientByCode:', error);
    return { data: null, error };
  }
};
