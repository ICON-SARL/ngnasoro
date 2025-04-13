
import { UserSfd } from './types';

/**
 * Fetches SFD accounts associated with a user
 */
export async function fetchUserSfds(userId: string): Promise<UserSfd[]> {
  if (!userId) return [];
  
  try {
    // Check if this is a test user by email domain or test in userId
    if (userId.includes('test') || userId === 'client@test.com') {
      // Return predefined SFDs for test accounts with proper UserSfd structure
      return [
        {
          id: 'test-sfd1',
          user_id: userId,
          sfd_id: 'premier-sfd-id',
          is_default: false,
          created_at: new Date().toISOString(),
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
          user_id: userId,
          sfd_id: 'deuxieme-sfd-id',
          is_default: true,
          created_at: new Date().toISOString(),
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
          user_id: userId,
          sfd_id: 'troisieme-sfd-id',
          is_default: false,
          created_at: new Date().toISOString(),
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
    
    // Ensure the response matches the UserSfd interface
    const formattedSfds: UserSfd[] = sfdsList.map((sfd: any) => ({
      id: sfd.id,
      user_id: userId,
      sfd_id: sfd.sfds.id,
      is_default: sfd.is_default,
      created_at: sfd.created_at || new Date().toISOString(),
      sfds: {
        id: sfd.sfds.id,
        name: sfd.sfds.name,
        code: sfd.sfds.code,
        region: sfd.sfds.region,
        logo_url: sfd.sfds.logo_url
      }
    }));
    
    return formattedSfds;
  } catch (error) {
    console.error('Error fetching SFDs:', error);
    return [];
  }
}
