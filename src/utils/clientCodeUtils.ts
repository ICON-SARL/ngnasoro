import { supabase } from '@/integrations/supabase/client';

export const formatClientCode = (code: string): string => {
  // Remove spaces and convert to uppercase
  code = code.replace(/\s/g, '').toUpperCase();
  
  // Handle legacy SFD-****** format
  if (code.startsWith('SFD-')) {
    // Extract the important parts
    const parts = code.split('-');
    if (parts.length >= 2) {
      const identifier = parts[1];
      // Add MEREF prefix and ensure proper formatting
      return `MEREF-SFD${identifier}${parts[2] || ''}`
        .replace(/^(MEREF-SFD[A-Z0-9]{6})(.*)$/, '$1-')  // Add hyphen after first 6 chars
        + (parts[2] || generateNumericPart());  // Add or keep the numeric part
    }
  }
  
  // If code doesn't start with MEREF-SFD, prepend it
  if (!code.startsWith('MEREF-SFD')) {
    code = 'MEREF-SFD' + code;
  }
  
  // Add hyphen after the first part if needed
  if (code.length >= 14 && code[14] !== '-') {
    code = code.slice(0, 14) + '-' + code.slice(14);
  }
  
  // If numeric part is missing, generate it
  if (!code.includes('-', 14)) {
    code += '-' + generateNumericPart();
  }
  
  return code;
};

// Helper function to generate the numeric part
const generateNumericPart = (): string => {
  return Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join('');
};

export const validateClientCode = (code: string): boolean => {
  // Accept both old and new formats
  return (
    /^MEREF-SFD[A-Z0-9]{6}-\d{4}$/.test(code) ||  // New format
    /^SFD-[A-Z0-9]{6}-\d{4}$/.test(code)          // Legacy format
  );
};

export const synchronizeClientCode = async (userId: string, clientCode: string, sfdId?: string) => {
  try {
    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ client_code: clientCode })
      .eq('id', userId);

    if (profileError) throw profileError;

    // If sfdId provided, update the client record too
    if (sfdId) {
      const { error: clientError } = await supabase
        .from('sfd_clients')
        .update({ client_code: clientCode })
        .eq('user_id', userId)
        .eq('sfd_id', sfdId);

      if (clientError) throw clientError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error synchronizing client code:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the client code for a specific user
 */
export const getClientCodeForUser = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('client_code')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.client_code || null;
  } catch (error) {
    console.error('Error getting client code:', error);
    return null;
  }
};

/**
 * Store a client code for a specific user
 */
export const storeClientCode = async (userId: string, clientCode: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ client_code: clientCode })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error storing client code:', error);
    return false;
  }
};

export async function lookupUserByClientCode(clientCode: string) {
  try {
    const { data, error } = await supabase
      .rpc('lookup_client_with_sfd', {
        p_client_code: clientCode,
        p_sfd_id: null
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error looking up client:', error);
    return null;
  }
}

/**
 * Create or update an SFD client record
 */
export const createOrUpdateSfdClient = async (
  sfdId: string, 
  userId: string, 
  clientData: Record<string, any>
) => {
  try {
    // Check if client already exists
    const { data: existingClient, error: checkError } = await supabase
      .from('sfd_clients')
      .select('id')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingClient) {
      // Update existing client
      const { data, error } = await supabase
        .from('sfd_clients')
        .update(clientData)
        .eq('id', existingClient.id)
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, client: data };
    } else {
      // Create new client
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          ...clientData,
          user_id: userId,
          sfd_id: sfdId
        })
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, client: data };
    }
  } catch (error: any) {
    console.error('Error creating/updating SFD client:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get SFD client by client code
 */
export const getSfdClientByCode = async (clientCode: string, sfdId: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('client_code', clientCode)
      .eq('sfd_id', sfdId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting SFD client by code:', error);
    return null;
  }
};
