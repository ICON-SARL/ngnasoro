
/**
 * Utility functions for generating and validating client codes
 */

import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';
import { SfdClient } from '@/types/sfdClients';

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
    localStorage.setItem(`client_code_${userId}`, clientCode);
    
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

export async function lookupUserByClientCode(clientCode: string): Promise<Profile | null> {
  try {
    if (!validateClientCode(clientCode)) {
      console.log('Invalid client code format:', clientCode);
      return null;
    }
    
    const formattedCode = formatClientCode(clientCode);
    
    // First check profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_code', formattedCode)
      .maybeSingle();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profiles:', profileError);
      throw profileError;
    }
    
    if (profileData) {
      console.log('Found user by client code in profiles:', profileData);
      return profileData as Profile;
    }
    
    // If not found in profiles, check sfd_clients table
    const { data: sfdClientData, error: sfdClientError } = await supabase
      .from('sfd_clients')
      .select('*, user:user_id(id, full_name, email, phone)')
      .eq('client_code', formattedCode)
      .maybeSingle();
      
    if (sfdClientError && sfdClientError.code !== 'PGRST116') {
      console.error('Error checking sfd_clients:', sfdClientError);
      throw sfdClientError;
    }
    
    if (sfdClientData?.user) {
      console.log('Found user by client code in sfd_clients:', sfdClientData);
      // Return profile-compatible object
      const userData = sfdClientData.user as any;
      return {
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
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
 * Synchronize client code between profiles and sfd_clients
 */
export async function synchronizeClientCode(userId: string, clientCode?: string): Promise<boolean> {
  try {
    // If client code not provided, try to get it
    if (!clientCode) {
      clientCode = await getClientCodeForUser(userId);
      if (!clientCode) {
        clientCode = generateClientCode();
        await storeClientCode(userId, clientCode);
      }
    }
    
    // Find all SFD clients for this user
    const { data: sfdClientsData, error: sfdClientsError } = await supabase
      .from('sfd_clients')
      .select('id')
      .eq('user_id', userId);
      
    if (sfdClientsError) {
      console.error('Error finding SFD clients to sync:', sfdClientsError);
      return false;
    }
    
    // If user has SFD client records, update them with the client code
    if (sfdClientsData && sfdClientsData.length > 0) {
      for (const client of sfdClientsData) {
        const { error } = await supabase
          .from('sfd_clients')
          .update({ client_code: clientCode })
          .eq('id', client.id);
          
        if (error) {
          console.error('Error updating client code for SFD client:', error);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error synchronizing client code:', error);
    return false;
  }
}

/**
 * Get an existing client from SFD by client code
 */
export async function getSfdClientByCode(clientCode: string): Promise<SfdClient | null> {
  if (!validateClientCode(clientCode)) {
    return null;
  }
  
  const formattedCode = formatClientCode(clientCode);
  
  try {
    // Check in sfd_clients directly first
    const { data: directClientData, error: directClientError } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('client_code', formattedCode)
      .maybeSingle();
      
    if (directClientError && directClientError.code !== 'PGRST116') {
      console.error('Error checking sfd_clients directly:', directClientError);
      throw directClientError;
    }
    
    if (directClientData) {
      return directClientData as SfdClient;
    }
    
    // Check via profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('client_code', formattedCode)
      .maybeSingle();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profiles for client code:', profileError);
      throw profileError;
    }
    
    if (profileData?.id) {
      // Found profile, now check if they're an SFD client
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('user_id', profileData.id)
        .maybeSingle();
        
      if (clientError && clientError.code !== 'PGRST116') {
        console.error('Error checking sfd_clients by user_id:', clientError);
        throw clientError;
      }
      
      if (clientData) {
        // Found client, update their client_code if needed
        if (!clientData.client_code) {
          await supabase
            .from('sfd_clients')
            .update({ client_code: formattedCode })
            .eq('id', clientData.id);
        }
        return clientData as SfdClient;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting SFD client by code:', error);
    return null;
  }
}
