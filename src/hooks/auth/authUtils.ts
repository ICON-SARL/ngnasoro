
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';

export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    phone: supabaseUser.phone,
    sfd_id: supabaseUser.user_metadata?.sfd_id || supabaseUser.app_metadata?.sfd_id,
    user_metadata: {
      ...supabaseUser.user_metadata
    },
    app_metadata: {
      ...supabaseUser.app_metadata,
      // Ensure role is set properly for SFD admins
      role: supabaseUser.app_metadata?.role || 
            (supabaseUser.user_metadata?.role === 'sfd_admin' ? 'sfd_admin' : undefined) ||
            (supabaseUser.user_metadata?.sfd_id ? 'sfd_admin' : undefined)
    }
  };
};
