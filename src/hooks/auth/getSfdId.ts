
import { User } from './types';

/**
 * Helper function to get the SFD ID from a user object
 * Checks both user_metadata and app_metadata to ensure compatibility
 */
export const getSfdId = (user: User | null): string | undefined => {
  if (!user) return undefined;
  
  // Check all possible locations of sfd_id
  return user.sfd_id || 
         user.user_metadata?.sfd_id || 
         user.app_metadata?.sfd_id;
};
