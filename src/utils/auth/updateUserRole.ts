
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/hooks/auth/types';

/**
 * Updates a user's role in the Supabase auth.users table via the admin API
 * This requires service_role access and should generally not be used in the frontend
 */
export const updateUserRole = async (userId: string, role: UserRole | string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { app_metadata: { role } }
    );
    
    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error updating user role:', err);
    return false;
  }
};

/**
 * Set default role for new users on signup
 * Note: This should be called when a new user signs up
 */
export const setDefaultUserRole = async (userId: string): Promise<boolean> => {
  return updateUserRole(userId, UserRole.User);
};
