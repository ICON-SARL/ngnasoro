
/**
 * Functions for looking up users and clients by client code
 */
import { supabase } from '@/integrations/supabase/client';

export const lookupUserByClientCode = async (clientCode: string, sfdId: string | null) => {
  try {
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
    } else {
      console.log('No client found with code:', clientCode);
    }
    
    return data;
  } catch (error) {
    console.error('Error looking up client:', error);
    throw error; // Let the calling code handle the error
  }
};

export const getSfdClientByCode = async (clientCode: string, sfdId: string) => {
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
    return data;
  } catch (error) {
    console.error('Error getting SFD client by code:', error);
    throw error; // Let the calling code handle the error
  }
};
