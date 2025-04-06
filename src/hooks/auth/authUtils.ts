
import { User } from './types';
import { User as SupabaseUser } from '@supabase/supabase-js';

export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name as string || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url as string || '',
    phone: supabaseUser.user_metadata?.phone as string || '',
    sfd_id: supabaseUser.user_metadata?.sfd_id as string || '',
    user_metadata: supabaseUser.user_metadata || {},
    app_metadata: {
      role: supabaseUser.app_metadata?.role as string || '',
      role_assigned: supabaseUser.app_metadata?.role_assigned as boolean || false,
      roles: supabaseUser.app_metadata?.roles as string[] || []
    }
  };
};

export const isUserAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.app_metadata?.role === 'admin';
};

export const isUserSfdAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.app_metadata?.role === 'sfd_admin';
};

export const getUserRole = (user: User | null): string | null => {
  if (!user) return null;
  return user.app_metadata?.role || null;
};
