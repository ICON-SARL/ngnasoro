
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';

export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    ...supabaseUser,
    full_name: supabaseUser.user_metadata?.full_name || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    sfd_id: supabaseUser.user_metadata?.sfd_id || supabaseUser.app_metadata?.sfd_id,
  };
};
