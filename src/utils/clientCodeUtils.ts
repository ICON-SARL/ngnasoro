
import { supabase } from '@/integrations/supabase/client';
import { 
  getClientCodeForUser, 
  storeClientCode 
} from './client-code/storage';
import { 
  generateClientCode, 
  generateNumericPart 
} from './client-code/generators';
import { 
  validateClientCode, 
  isLegacyFormat 
} from './client-code/validators';
import { 
  formatClientCode, 
  cleanClientCode 
} from './client-code/formatters';
import { 
  synchronizeClientCode 
} from './client-code/sync';
import { 
  lookupUserByClientCode,
  getSfdClientByCode,
  type ClientLookupResult 
} from './client-code/lookup';

// Re-export all the functions
export { 
  getClientCodeForUser,
  storeClientCode,
  generateClientCode,
  generateNumericPart,
  validateClientCode,
  isLegacyFormat,
  formatClientCode,
  cleanClientCode,
  synchronizeClientCode,
  lookupUserByClientCode,
  getSfdClientByCode,
  type ClientLookupResult
};

// Function to create or update SFD client
export const createOrUpdateSfdClient = async (
  sfdId: string, 
  userId: string, 
  clientData: any
) => {
  try {
    // Check if client exists
    const { data: existingClient, error: checkError } = await supabase
      .from('sfd_clients')
      .select('id')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing client:', checkError);
      return { success: false, error: checkError.message };
    }
    
    if (existingClient) {
      // Update existing client
      const { data, error } = await supabase
        .from('sfd_clients')
        .update(clientData)
        .eq('id', existingClient.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating client:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, client: data };
    } else {
      // Create new client
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          ...clientData,
          sfd_id: sfdId,
          user_id: userId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating client:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, client: data };
    }
  } catch (error: any) {
    console.error('Error in createOrUpdateSfdClient:', error);
    return { success: false, error: error.message };
  }
};
