
/**
 * Utility functions for generating and validating client codes
 */

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
    
    // If not in local storage, we need to check if the client_code field exists
    // and then proceed to query it if it exists
    const { supabase } = await import('@/integrations/supabase/client');
    
    // We need to handle the case where client_code might not exist in the profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Check if we have client_code in the result
      if (error || !data) {
        return null;
      }
      
      // Cast to any to avoid TypeScript errors when accessing client_code
      const profile = data as any;
      const clientCode = profile.client_code;
      
      if (clientCode) {
        // Store in local storage for future use
        localStorage.setItem(`client_code_${userId}`, clientCode);
        return clientCode;
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
    // We need to handle the case where client_code might not exist in the profiles table
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      // Use a more flexible approach to update the profile - using a custom update object
      const updateData: Record<string, any> = { 
        client_code: clientCode
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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
    const { supabase } = await import('@/integrations/supabase/client');
    
    // We need to handle the case where client_code might not be in the profiles table
    // Let's try a more general approach using a RPC call if available, or direct select
    try {
      // Try to get from profiles first - cast to any to avoid TypeScript errors
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('client_code', formattedCode)
        .maybeSingle();

      if (!profileError && profileData) {
        return profileData;
      }

      // If not found in profiles, try to find in verification_documents
      const { data: verificationData, error: verificationError } = await supabase
        .from('verification_documents')
        .select('client_code, user_id')
        .eq('client_code', formattedCode)
        .maybeSingle();

      if (verificationError || !verificationData) {
        return null;
      }

      // If we found a match in verification_documents, get the user profile
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', verificationData.user_id)
        .single();

      if (userError || !userData) {
        return null;
      }

      return userData;
    } catch (error) {
      console.error('Error in lookupUserByClientCode:', error);
      return null;
    }
  } catch (error) {
    console.error('Error looking up user by client code:', error);
    return null;
  }
}
