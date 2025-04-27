
import { supabase } from '@/integrations/supabase/client';

export const formatClientCode = (code: string): string => {
  // Remove spaces and convert to uppercase
  code = code.replace(/\s/g, '').toUpperCase();
  
  // If code doesn't start with MEREF-SFD, prepend it
  if (!code.startsWith('MEREF-SFD')) {
    code = 'MEREF-SFD' + code;
  }
  
  // Add hyphen after the SFD part if needed
  if (code.length >= 15 && code[14] !== '-') {
    code = code.slice(0, 14) + '-' + code.slice(14);
  }
  
  return code;
};

export const validateClientCode = (code: string): boolean => {
  return /^MEREF-SFD[A-Z0-9]{6}-\d{4}$/.test(code);
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
