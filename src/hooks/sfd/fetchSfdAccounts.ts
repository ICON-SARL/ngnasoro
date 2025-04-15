
import { supabase } from '@/integrations/supabase/client';
import { SfdAccount, SfdClientAccount } from './types';

export async function fetchUserSfds(userId: string) {
  if (!userId) return [];
  
  try {
    console.log(`Fetching SFDs for user ${userId}...`);
    
    // Récupérer toutes les SFDs actives
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

    console.log(`Found ${activeSfds?.length || 0} active SFDs`);
    
    // Pour les comptes de test, retourner des données de test
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

    // S'assurer de retourner toutes les SFDs actives
    console.log(`Returning ${activeSfds?.length || 0} active SFDs for user ${userId}`);
    return activeSfds || [];
  } catch (error) {
    console.error('Error in fetchUserSfds:', error);
    return [];
  }
}
