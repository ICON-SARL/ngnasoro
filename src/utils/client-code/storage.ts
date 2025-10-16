
/**
 * Functions for storing and retrieving client codes
 */
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';

export const getClientCodeForUser = async (userId: string): Promise<string | null> => {
  try {
    console.log('Fetching client code for user:', userId);
    
    // profiles table doesn't have client_code column
    console.warn('getClientCodeForUser: client_code column does not exist in profiles table');
    return null;
  } catch (error) {
    console.error('Error getting client code:', error);
    handleError(error);
    return null;
  }
};

export const storeClientCode = async (userId: string, clientCode: string): Promise<boolean> => {
  try {
    console.log('Storing client code for user:', userId, 'code:', clientCode);
    
    // profiles table doesn't have client_code column
    console.warn('storeClientCode: client_code column does not exist in profiles table');
    return false;
  } catch (error) {
    console.error('Error storing client code:', error);
    handleError(error);
    return false;
  }
};
