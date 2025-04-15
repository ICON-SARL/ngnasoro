
import { UserSfd } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches SFD accounts associated with a user
 */
export async function fetchUserSfds(userId: string): Promise<UserSfd[]> {
  if (!userId) return [];
  
  try {
    // Check if this is a test user by email domain or test in userId
    if (userId.includes('test') || userId === 'client@test.com') {
      // Return predefined SFDs for test accounts
      return [
        {
          id: 'test-sfd1',
          is_default: false,
          sfds: {
            id: 'premier-sfd-id',
            name: 'Premier SFD',
            code: 'P',
            region: 'Centre',
            logo_url: null
          }
        },
        {
          id: 'test-sfd2',
          is_default: true,
          sfds: {
            id: 'deuxieme-sfd-id',
            name: 'Deuxième SFD',
            code: 'D',
            region: 'Nord',
            logo_url: null
          }
        },
        {
          id: 'test-sfd3',
          is_default: false,
          sfds: {
            id: 'troisieme-sfd-id',
            name: 'Troisième SFD',
            code: 'T',
            region: 'Sud',
            logo_url: null
          }
        }
      ];
    }
    
    // Essayer d'abord de récupérer les SFDs via la fonction edge
    try {
      const { data: sfdsList, error } = await supabase.functions.invoke('fetch-sfds', {
        body: { userId }
      });
      
      if (!error && sfdsList && Array.isArray(sfdsList) && sfdsList.length > 0) {
        // Transformer le format des données pour correspondre à UserSfd
        return sfdsList.map(sfd => ({
          id: `user-sfd-${sfd.id}`,
          is_default: false, // Par défaut, pas défini comme SFD par défaut
          sfds: {
            id: sfd.id,
            name: sfd.name,
            code: sfd.code,
            region: sfd.region || '',
            logo_url: sfd.logo_url
          }
        }));
      }
    } catch (functionError) {
      console.error('Error fetching SFDs from edge function:', functionError);
      // Continue avec la méthode de secours ci-dessous
    }
    
    // Méthode de secours: récupérer toutes les SFDs actives
    const { data: allActiveSfds, error: sfdsError } = await supabase
      .from('sfds')
      .select('id, name, code, region, logo_url')
      .eq('status', 'active');
      
    if (sfdsError) {
      console.error('Error fetching active SFDs:', sfdsError);
      return [];
    }
    
    if (allActiveSfds && allActiveSfds.length > 0) {
      return allActiveSfds.map(sfd => ({
        id: `all-sfd-${sfd.id}`,
        is_default: false,
        sfds: {
          id: sfd.id,
          name: sfd.name,
          code: sfd.code,
          region: sfd.region || '',
          logo_url: sfd.logo_url
        }
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching SFDs:', error);
    return [];
  }
}
