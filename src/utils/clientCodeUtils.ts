
/**
 * Utility functions for generating and validating client codes
 */

import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';
import { SfdClient } from '@/types/sfdClients';
import { useToast } from '@/hooks/use-toast';

/**
 * Generates a unique client code with a specified format
 * Format: SFD-[6 alphanumeric chars]-[4 digits]
 */
export function generateClientCode(sfdPrefix?: string): string {
  // Generate random alphanumeric segment (6 characters)
  const alphanumeric = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars
  let alphaSegment = '';
  for (let i = 0; i < 6; i++) {
    alphaSegment += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  
  // Generate random numeric segment (4 digits)
  const numericSegment = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Create the code with optional SFD prefix or default "SFD"
  const prefix = sfdPrefix || 'SFD';
  return `${prefix}-${alphaSegment}-${numericSegment}`;
}

/**
 * Validates a client code format
 * @param code The code to validate
 * @returns boolean indicating if the code is valid
 */
export function validateClientCode(code: string): boolean {
  // Basic validation - adjust regex as needed for your exact format
  const regex = /^[A-Z]+-[A-Z0-9]{6}-\d{4}$/;
  return regex.test(code);
}

/**
 * Format a potentially raw code to the proper format
 * @param code The raw code input
 * @returns Formatted code
 */
export function formatClientCode(code: string): string {
  // Remove spaces and convert to uppercase
  let formattedCode = code.replace(/\s/g, '').toUpperCase();
  
  // If the code is only the alphanumeric and numeric parts without prefix
  if (/^[A-Z0-9]{6}-\d{4}$/.test(formattedCode)) {
    formattedCode = `SFD-${formattedCode}`;
  }
  
  return formattedCode;
}

export async function getClientCodeForUser(userId: string): Promise<string | null> {
  try {
    const storedCode = localStorage.getItem(`client_code_${userId}`);
    if (storedCode) {
      return storedCode;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('client_code')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error retrieving client code:', error);
      return null;
    }
    
    if (data.client_code) {
      localStorage.setItem(`client_code_${userId}`, data.client_code);
      return data.client_code;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving client code:', error);
    return null;
  }
}

export async function storeClientCode(userId: string, clientCode: string): Promise<boolean> {
  try {
    // Store in local storage for quick access
    localStorage.setItem(`client_code_${userId}`, clientCode);
    
    // Update the profile in database
    const { error } = await supabase
      .from('profiles')
      .update({ client_code: clientCode })
      .eq('id', userId);
    
    if (error) {
      console.error('Error storing client code in profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error storing client code:', error);
    return false;
  }
}

/**
 * Improved lookup user by client code with better error handling
 * @param clientCode Client code to search for
 * @returns Profile if found, null otherwise
 */
export async function lookupUserByClientCode(clientCode: string): Promise<Profile | null> {
  try {
    if (!validateClientCode(clientCode)) {
      console.log('Invalid client code format:', clientCode);
      return null;
    }
    
    const formattedCode = formatClientCode(clientCode);
    console.log('Looking up user with client code:', formattedCode);
    
    // First approach: direct join query (most efficient)
    const { data: joinData, error: joinError } = await supabase
      .rpc('lookup_user_by_client_code', {
        p_client_code: formattedCode
      });
      
    if (joinError) {
      console.error('Error with RPC lookup:', joinError);
      // Fall back to sequential queries if RPC not available
    } else if (joinData) {
      console.log('Found user via RPC:', joinData);
      return joinData as Profile;
    }
    
    // Second approach: check profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_code', formattedCode)
      .maybeSingle();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profiles:', profileError);
      // Continue to next approach instead of throwing
    } else if (profileData) {
      console.log('Found user by client code in profiles:', profileData);
      return profileData as Profile;
    }
    
    // Third approach: check sfd_clients table and join with profiles
    const { data: sfdClientData, error: sfdClientError } = await supabase
      .from('sfd_clients')
      .select(`
        id,
        full_name,
        email,
        phone,
        client_code,
        user_id,
        profiles:user_id (
          id, 
          full_name, 
          email, 
          phone,
          client_code
        )
      `)
      .eq('client_code', formattedCode)
      .maybeSingle();
      
    if (sfdClientError && sfdClientError.code !== 'PGRST116') {
      console.error('Error checking sfd_clients:', sfdClientError);
    } else if (sfdClientData?.user_id && sfdClientData.profiles) {
      console.log('Found user via sfd_clients lookup:', sfdClientData);
      
      // If the client has a user_id but the profile doesn't have this client code, sync it
      const profileFromJoin = sfdClientData.profiles as any;
      if (profileFromJoin && !profileFromJoin.client_code) {
        await storeClientCode(sfdClientData.user_id, formattedCode);
      }
      
      // Return profile-compatible object
      return {
        id: sfdClientData.user_id,
        full_name: profileFromJoin.full_name || sfdClientData.full_name,
        email: profileFromJoin.email || sfdClientData.email,
        phone: profileFromJoin.phone || sfdClientData.phone,
        client_code: formattedCode
      } as Profile;
    }
    
    console.log('No user found with client code:', formattedCode);
    return null;
  } catch (error) {
    console.error('Error looking up user by client code:', error);
    return null;
  }
}

/**
 * Get an existing client from SFD by client code
 * Enhanced to better handle data inconsistency
 */
export async function getSfdClientByCode(clientCode: string, sfdId?: string): Promise<SfdClient | null> {
  if (!validateClientCode(clientCode)) {
    console.log('Invalid client code format:', clientCode);
    return null;
  }
  
  const formattedCode = formatClientCode(clientCode);
  console.log('Looking up SFD client with code:', formattedCode);
  
  try {
    // Check in sfd_clients directly with client_code first
    let query = supabase
      .from('sfd_clients')
      .select('*')
      .eq('client_code', formattedCode);
      
    if (sfdId) {
      query = query.eq('sfd_id', sfdId);
    }
    
    const { data: directClientData, error: directClientError } = await query.maybeSingle();
      
    if (directClientError && directClientError.code !== 'PGRST116') {
      console.error('Error checking sfd_clients directly:', directClientError);
      throw directClientError;
    }
    
    if (directClientData) {
      console.log('Found client directly by client_code:', directClientData);
      return directClientData as SfdClient;
    }
    
    // If no direct match, try to find via profiles and then check if they're an SFD client
    const profile = await lookupUserByClientCode(formattedCode);
    
    if (profile?.id) {
      console.log('Found profile for client code, checking SFD clients with user_id:', profile.id);
      
      // Found profile, now check if they're an SFD client
      let userQuery = supabase
        .from('sfd_clients')
        .select('*')
        .eq('user_id', profile.id);
        
      if (sfdId) {
        userQuery = userQuery.eq('sfd_id', sfdId);
      }
      
      const { data: clientData, error: clientError } = await userQuery.maybeSingle();
        
      if (clientError && clientError.code !== 'PGRST116') {
        console.error('Error checking sfd_clients by user_id:', clientError);
        throw clientError;
      }
      
      if (clientData) {
        console.log('Found client via user_id:', clientData);
        
        // Found client, update their client_code if needed
        if (!clientData.client_code) {
          console.log('Syncing client code to sfd_client record');
          
          const { error: updateError } = await supabase
            .from('sfd_clients')
            .update({ client_code: formattedCode })
            .eq('id', clientData.id);
            
          if (updateError) {
            console.error('Error updating client code:', updateError);
          }
          
          return {
            ...clientData,
            client_code: formattedCode
          } as SfdClient;
        }
        
        return clientData as SfdClient;
      } else {
        console.log('Found user profile but not an SFD client yet');
      }
    }
    
    console.log('No SFD client found for code:', formattedCode);
    return null;
  } catch (error) {
    console.error('Error getting SFD client by code:', error);
    return null;
  }
}

/**
 * Synchronize client code between profiles and sfd_clients
 */
export async function synchronizeClientCode(userId: string, clientCode?: string): Promise<boolean> {
  try {
    console.log(`Synchronizing client code for user ${userId}`);
    
    // If client code not provided, try to get it
    if (!clientCode) {
      clientCode = await getClientCodeForUser(userId);
      
      // If still no client code, generate a new one
      if (!clientCode) {
        clientCode = generateClientCode();
        console.log(`Generated new client code: ${clientCode}`);
        
        // Store the newly generated code
        const stored = await storeClientCode(userId, clientCode);
        if (!stored) {
          console.error('Failed to store newly generated client code');
          return false;
        }
      }
    }
    
    // Find all SFD clients for this user
    const { data: sfdClientsData, error: sfdClientsError } = await supabase
      .from('sfd_clients')
      .select('id, client_code')
      .eq('user_id', userId);
      
    if (sfdClientsError) {
      console.error('Error finding SFD clients to sync:', sfdClientsError);
      return false;
    }
    
    let updateSuccessCount = 0;
    
    // If user has SFD client records, update them with the client code
    if (sfdClientsData && sfdClientsData.length > 0) {
      for (const client of sfdClientsData) {
        // Only update if client code is missing or different
        if (!client.client_code || client.client_code !== clientCode) {
          const { error } = await supabase
            .from('sfd_clients')
            .update({ client_code: clientCode })
            .eq('id', client.id);
            
          if (error) {
            console.error('Error updating client code for SFD client:', error);
          } else {
            updateSuccessCount++;
          }
        } else {
          updateSuccessCount++; // Count as success if already correct
        }
      }
      
      const allSuccessful = updateSuccessCount === sfdClientsData.length;
      console.log(`Sync complete. Updated ${updateSuccessCount}/${sfdClientsData.length} client records.`);
      return allSuccessful;
    }
    
    console.log('No SFD clients found for this user. Client code updated in profile only.');
    return true;
  } catch (error) {
    console.error('Error synchronizing client code:', error);
    return false;
  }
}

/**
 * Create or update a client record for a user in a specific SFD
 * @param sfdId SFD ID
 * @param userId User ID
 * @param clientData Client data to update or create with
 * @returns Created/Updated client record or error
 */
export async function createOrUpdateSfdClient(
  sfdId: string, 
  userId: string,
  clientData: {
    full_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    client_code?: string;
    status?: string;
    [key: string]: any;
  }
): Promise<{success: boolean; client?: SfdClient; error?: string}> {
  try {
    // First check if client already exists
    const { data: existingClient, error: checkError } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('sfd_id', sfdId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing client:', checkError);
      return { success: false, error: checkError.message };
    }
    
    // Ensure client code is synchronized
    if (!clientData.client_code) {
      const userClientCode = await getClientCodeForUser(userId);
      if (userClientCode) {
        clientData.client_code = userClientCode;
      } else {
        const newCode = generateClientCode();
        await storeClientCode(userId, newCode);
        clientData.client_code = newCode;
      }
    }
    
    if (existingClient) {
      // Update existing client
      console.log('Updating existing client:', existingClient.id);
      const { data: updatedClient, error: updateError } = await supabase
        .from('sfd_clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingClient.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating client:', updateError);
        return { success: false, error: updateError.message };
      }
      
      return { success: true, client: updatedClient as SfdClient };
    } else {
      // Create new client
      console.log('Creating new SFD client for user:', userId);
      const { data: newClient, error: createError } = await supabase
        .from('sfd_clients')
        .insert({
          sfd_id: sfdId,
          user_id: userId,
          status: clientData.status || 'pending',
          ...clientData
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating client:', createError);
        return { success: false, error: createError.message };
      }
      
      return { success: true, client: newClient as SfdClient };
    }
  } catch (error: any) {
    console.error('Error in createOrUpdateSfdClient:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}
