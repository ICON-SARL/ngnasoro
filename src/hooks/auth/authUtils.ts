
import { User } from './types';
import { User as SupabaseUser } from '@supabase/supabase-js';

export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    ...supabaseUser,
    app_metadata: supabaseUser.app_metadata || { role: 'user' },
    user_metadata: supabaseUser.user_metadata || {},
    // Map common properties for easier access
    full_name: supabaseUser.user_metadata?.full_name || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    sfd_id: supabaseUser.app_metadata?.sfd_id,
    phone: supabaseUser.phone || supabaseUser.user_metadata?.phone
  };
};

export const getRoleFromUser = (user: User | null): string => {
  if (!user) return 'anonymous';
  return user.app_metadata?.role || 'user';
};

export const isAdminRole = (role: string): boolean => {
  return role === 'admin';
};

export const isSfdAdminRole = (role: string): boolean => {
  return role === 'sfd_admin';
};

export const isClientRole = (role: string): boolean => {
  return role === 'client' || role === 'user';
};
