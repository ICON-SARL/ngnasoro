
import { UserSfd } from './types';

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
    
    // Normal path for non-test users
    const { apiClient } = await import('@/utils/apiClient');
    const sfdsListRaw = await apiClient.getUserSfds(userId);
    
    // Make sure the returned data matches UserSfd type
    const sfdsList: UserSfd[] = sfdsListRaw.map((item: any) => ({
      id: item.id,
      is_default: item.is_default,
      sfds: {
        id: item.sfds?.id || '',
        name: item.sfds?.name || '',
        code: item.sfds?.code,
        region: item.sfds?.region,
        logo_url: item.sfds?.logo_url
      }
    }));
    
    return sfdsList;
  } catch (error) {
    console.error('Error fetching SFDs:', error);
    return [];
  }
}
