
/**
 * Functions for storing and retrieving client codes
 */
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';

export const getClientCodeForUser = async (userId: string): Promise<string | null> => {
  try {
    console.log('Fetching client code for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('client_code, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting client code:', error);
      handleError(error);
      return null;
    }

    console.log('Client code data:', data);
    return data?.client_code || null;
  } catch (error) {
    console.error('Error getting client code:', error);
    handleError(error);
    return null;
  }
};

export const storeClientCode = async (userId: string, clientCode: string): Promise<boolean> => {
  try {
    console.log('Storing client code for user:', userId, 'code:', clientCode);
    
    const { error } = await supabase
      .from('profiles')
      .update({ client_code: clientCode })
      .eq('id', userId);

    if (error) {
      console.error('Error storing client code:', error);
      handleError(error);
      return false;
    }

    console.log('Client code stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing client code:', error);
    handleError(error);
    return false;
  }
};
