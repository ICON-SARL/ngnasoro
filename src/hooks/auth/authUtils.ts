
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';

export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  // Convert Supabase user to our app's User type
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    phone: supabaseUser.phone || null,
    sfd_id: supabaseUser.user_metadata?.sfd_id || supabaseUser.app_metadata?.sfd_id,
    user_metadata: {
      ...supabaseUser.user_metadata
    },
    app_metadata: {
      // Ensure we correctly map app_metadata properties
      role: supabaseUser.app_metadata?.role || 
            (supabaseUser.user_metadata?.role === 'sfd_admin' ? 'sfd_admin' : undefined) ||
            (supabaseUser.user_metadata?.sfd_id ? 'sfd_admin' : undefined),
      role_assigned: supabaseUser.app_metadata?.role_assigned || false,
      roles: supabaseUser.app_metadata?.roles || [],
      sfd_id: supabaseUser.app_metadata?.sfd_id || supabaseUser.user_metadata?.sfd_id
    }
  };
};
