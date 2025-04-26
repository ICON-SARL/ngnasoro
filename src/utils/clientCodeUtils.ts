
/**
 * Utility functions for generating and validating client codes
 */

import { supabase } from '@/integrations/supabase/client';

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

/**
 * Retrieve client code from local storage or user profile
 * @param userId The user ID to get code for
 * @returns The client code or null if not found
 */
export async function getClientCodeForUser(userId: string): Promise<string | null> {
  try {
    // First check local storage
    const storedCode = localStorage.getItem(`client_code_${userId}`);
    if (storedCode) {
      return storedCode;
    }
    
    // If not in local storage, check the profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      // If client_code exists in the data object
      if (data.client_code) {
        // Store in local storage for future use
        localStorage.setItem(`client_code_${userId}`, data.client_code);
        return data.client_code;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving client code:', error);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving client code:', error);
    return null;
  }
}

/**
 * Store client code for a user
 * @param userId The user ID
 * @param clientCode The client code to store
 */
export async function storeClientCode(userId: string, clientCode: string): Promise<boolean> {
  try {
    // Store in local storage
    localStorage.setItem(`client_code_${userId}`, clientCode);
    
    // Store in the user's profile
    try {
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
      console.error('Error updating profile:', error);
      return false;
    }
  } catch (error) {
    console.error('Error storing client code:', error);
    return false;
  }
}

/**
 * Look up a user by their client code
 * @param clientCode The client code to look up
 * @returns The user profile data or null if not found
 */
export async function lookupUserByClientCode(clientCode: string): Promise<any | null> {
  try {
    if (!validateClientCode(clientCode)) {
      return null;
    }
    
    const formattedCode = formatClientCode(clientCode);
    
    // Try to get from profiles first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_code', formattedCode)
      .maybeSingle();

    if (!profileError && profileData) {
      return profileData;
    }

    // If not found in profiles, try to find in verification_documents
    const { data: docData, error: docError } = await supabase
      .from('verification_documents')
      .select('client_code')
      .eq('client_code', formattedCode)
      .maybeSingle();

    if (docError || !docData || !docData.client_code) {
      return null;
    }

    // If we found the client code in verification_documents, we still need to get the user data
    // Since we don't have user_id in verification_documents table, we can't directly link to profiles
    // This is a limitation of the current schema design
    return { clientCode: docData.client_code, source: 'verification_documents' };
      
  } catch (error) {
    console.error('Error looking up user by client code:', error);
    return null;
  }
}
