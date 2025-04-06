
import { User } from './types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    full_name: supabaseUser.user_metadata.full_name as string,
    avatar_url: supabaseUser.user_metadata.avatar_url as string,
    sfd_id: supabaseUser.user_metadata.sfd_id as string,
    phone: supabaseUser.user_metadata.phone as string,
    user_metadata: supabaseUser.user_metadata || {},
    app_metadata: {
      role: supabaseUser.app_metadata?.role as string,
      role_assigned: supabaseUser.app_metadata?.role_assigned as boolean,
      roles: supabaseUser.app_metadata?.roles as string[]
    }
  };
};

export const isUserAdmin = (session: Session | null): boolean => {
  if (!session?.user) return false;
  return session.user.app_metadata?.role === 'admin' || session.user.app_metadata?.role === 'sfd_admin';
};

export const getRoleFromSession = (session: Session | null): string | null => {
  if (!session?.user) return null;
  return session.user.app_metadata?.role || null;
};

export const getBiometricStatus = (session: Session | null): boolean => {
  if (!session?.user) return false;
  return session.user.user_metadata.biometric_enabled as boolean || false;
};
