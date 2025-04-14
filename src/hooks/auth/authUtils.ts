
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';

/**
 * Creates a User object from a Supabase user, ensuring all required properties
 * are properly mapped for our application
 */
export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  // Extract metadata
  const { app_metadata, user_metadata, ...rest } = supabaseUser;
  
  // Create our application User
  const user: User = {
    ...rest,
    app_metadata,
    user_metadata,
    
    // Add direct access properties for convenience
    full_name: user_metadata?.full_name,
    avatar_url: user_metadata?.avatar_url,
    sfd_id: app_metadata?.sfd_id
  };
  
  return user;
};
