
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User as AuthUser } from './types';

export function createUserFromSupabaseUser(supabaseUser: SupabaseUser): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    phone: supabaseUser.user_metadata?.phone,
    sfd_id: supabaseUser.user_metadata?.sfd_id || supabaseUser.app_metadata?.sfd_id,
    user_metadata: supabaseUser.user_metadata || {},
    app_metadata: {
      role: supabaseUser.app_metadata?.role,
      role_assigned: supabaseUser.app_metadata?.role_assigned,
      roles: supabaseUser.app_metadata?.roles,
      sfd_id: supabaseUser.app_metadata?.sfd_id
    }
  };
}
