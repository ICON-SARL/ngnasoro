
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';

export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  // Extract metadata for our custom properties
  const userMetadata = supabaseUser.user_metadata || {};
  const appMetadata = supabaseUser.app_metadata || {};
  
  // Create a proper User object with all expected properties
  return {
    ...supabaseUser,
    full_name: userMetadata.full_name || userMetadata.name || null,
    avatar_url: userMetadata.avatar_url || null,
    sfd_id: appMetadata.sfd_id || userMetadata.sfd_id || null,
    phone: userMetadata.phone || null
  } as User;
};
