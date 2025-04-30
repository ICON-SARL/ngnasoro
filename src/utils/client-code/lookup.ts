
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
    
    // If not found as a client, check profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, client_code')
      .eq('client_code', clientCode)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error looking up profile by client code:', profileError);
      return null;
    }
    
    if (profileData) {
      return {
        user_id: profileData.id,
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        client_code: profileData.client_code,
        is_new_client: true // Indicates this profile is not yet a client of the SFD
      };
    }
    
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
    const { data, error } = await supabase.rpc('lookup_client_with_sfd', {
      p_client_code: clientCode,
      p_sfd_id: sfdId
    });
    
    if (error) {
      console.error('Error getting SFD client by code:', error);
      return { data: null, error };
    }
    
    if (data) {
      return { 
        data: data as ClientLookupResult,
        error: null
      };
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Error in getSfdClientByCode:', error);
    return { data: null, error };
  }
};
