
import { User } from './types';

export const createUserFromSupabaseUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    phone: supabaseUser.user_metadata?.phone,
    sfd_id: supabaseUser.user_metadata?.sfd_id,
    user_metadata: supabaseUser.user_metadata || {},
    app_metadata: supabaseUser.app_metadata || {},
  };
};

export const getRoleFromSession = (session: any): string | null => {
  if (!session || !session.user) return null;
  return session.user.app_metadata?.role || null;
};
