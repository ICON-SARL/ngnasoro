
import { Session } from '@supabase/supabase-js';
import { UserRole } from './types';

/**
 * Extract user role from session
 */
export const getRoleFromSession = (session: Session): UserRole => {
  const role = session.user.app_metadata.role as UserRole;
  if (!role) return 'user';
  return role;
};

/**
 * Check if a user has a specific role
 */
export const hasRole = (session: Session | null, role: UserRole): boolean => {
  if (!session) return false;
  return getRoleFromSession(session) === role;
};

/**
 * Get the appropriate redirect path based on user role
 */
export const getRedirectPath = (session: Session | null): string => {
  if (!session) return '/auth';
  
  const role = getRoleFromSession(session);
  
  switch (role) {
    case 'admin':
      return '/super-admin-dashboard';
    case 'sfd_admin':
      return '/agency-dashboard';
    default:
      return '/mobile-flow';
  }
};
