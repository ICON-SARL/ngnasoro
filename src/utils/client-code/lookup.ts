
import { supabase } from '@/integrations/supabase/client';

// Type pour les résultats de recherche de clients
export interface ClientLookupResult {
  id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  client_code?: string;
  sfd_id?: string;
  status?: string;
  is_new_client?: boolean;
}

export const lookupUserByClientCode = async (clientCode: string, sfdId: string | null): Promise<ClientLookupResult | null> => {
  try {
    if (!sfdId) {
      console.error('No SFD ID provided for client lookup');
      throw new Error("Aucune SFD active sélectionnée. Veuillez d'abord sélectionner une SFD.");
    }
    
    console.log('Looking up client with code:', clientCode, 'for SFD:', sfdId);
    
    const { data, error } = await supabase
      .rpc('lookup_client_with_sfd', {
        p_client_code: clientCode,
        p_sfd_id: sfdId
      });

    if (error) {
      console.error('Error looking up client:', error);
      throw error;
    }
    
    if (data) {
      console.log('Found client:', data);
      // Explicitly cast data to ClientLookupResult with proper type checking
      if (Array.isArray(data)) {
        return data.length > 0 ? data[0] as ClientLookupResult : null;
      }
      
      if (typeof data === 'object' && data !== null && 'id' in data && 'full_name' in data) {
        return data as ClientLookupResult;
      } else {
        console.log('Data did not match expected format:', data);
        return null;
      }
    } else {
      console.log('No client found with code:', clientCode);
      return null;
    }
  } catch (error) {
    console.error('Error looking up client:', error);
    throw error; // Let the calling code handle the error
  }
};

export const getSfdClientByCode = async (clientCode: string, sfdId: string): Promise<ClientLookupResult | null> => {
  try {
    const { data, error } = await supabase
      .rpc('lookup_client_with_sfd', {
        p_client_code: clientCode,
        p_sfd_id: sfdId
      });

    if (error) {
      console.error('Error getting SFD client by code:', error);
      throw error;
    }
    
    // Explicitly cast data to ClientLookupResult with proper type validation
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] as ClientLookupResult : null;
    }
    
    if (data && typeof data === 'object' && 'id' in data && 'full_name' in data) {
      return data as ClientLookupResult;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting SFD client by code:', error);
    throw error; // Let the calling code handle the error
  }
};
