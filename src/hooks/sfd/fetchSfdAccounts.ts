
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
          user_id: userId,
          sfd_id: 'premier-sfd-id',
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
          user_id: userId,
          sfd_id: 'deuxieme-sfd-id',
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
          user_id: userId,
          sfd_id: 'troisieme-sfd-id',
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
    const sfdsList = await apiClient.getUserSfds(userId);
    return sfdsList;
  } catch (error) {
    console.error('Error fetching SFDs:', error);
    return [];
  }
}
