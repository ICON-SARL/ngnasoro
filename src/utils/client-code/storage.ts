
/**
 * Functions for storing and retrieving client codes
 */
import { supabase } from '@/integrations/supabase/client';

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
