import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';

/**
 * Fetches all loans
 */
export const getAllLoans = async (): Promise<Loan[]> => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loans:', error);
      return [];
    }

    return data as Loan[];
  } catch (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
};
