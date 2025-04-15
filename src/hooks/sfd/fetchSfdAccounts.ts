
import { supabase } from '@/integrations/supabase/client';
import { SfdAccount, SfdClientAccount } from './types';

export async function fetchUserSfds(userId: string) {
  if (!userId) return [];
  
  try {
    // Get all active SFDs
    const { data: activeSfds, error: sfdsError } = await supabase
      .from('sfds')
      .select(`
        id,
        name,
        code,
        region,
        status,
        logo_url
      `)
      .eq('status', 'active');
    
    if (sfdsError) {
      console.error('Error fetching SFDs:', sfdsError);
      return [];
    }

    // For test accounts, return test data
    if (userId.includes('test') || userId === 'client@test.com') {
      return [
        {
          id: 'test-sfd1',
          name: 'Premier SFD',
          code: 'P',
          region: 'Centre',
          logo_url: null,
          status: 'active'
        },
        {
          id: 'test-sfd2',
          name: 'Deuxième SFD',
          code: 'D',
          region: 'Nord',
          logo_url: null,
          status: 'active'
        }
      ];
    }

    return activeSfds || [];
  } catch (error) {
    console.error('Error in fetchUserSfds:', error);
    return [];
  }
}
