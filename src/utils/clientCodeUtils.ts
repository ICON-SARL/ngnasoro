/**
 * Utility functions for generating and validating client codes
 */

import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';

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
      return null;
    }
    
    const formattedCode = formatClientCode(clientCode);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_code', formattedCode)
      .maybeSingle();

    if (!profileError && profileData) {
      return profileData;
    }

    return null;
  } catch (error) {
    console.error('Error looking up user by client code:', error);
    return null;
  }
}
