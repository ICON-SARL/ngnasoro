
import { supabase } from '@/integrations/supabase/client';

// Add the missing function
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

// Functions to lookup users and clients
export const lookupUserByClientCode = async (clientCode: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_code', clientCode)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error looking up user by client code:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in lookupUserByClientCode:', error);
    throw error;
  }
};

export const getSfdClientByCode = async (clientCode: string, sfdId: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('client_code', clientCode)
      .eq('sfd_id', sfdId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting SFD client by code:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getSfdClientByCode:', error);
    throw error;
  }
};
