
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, Role } from './types';
import { supabase } from '@/integrations/supabase/client';

// Convert Supabase User to our custom User type
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
      role: supabaseUser.app_metadata?.role || 
            (supabaseUser.user_metadata?.role === 'sfd_admin' ? 'sfd_admin' : undefined) ||
            (supabaseUser.user_metadata?.sfd_id ? 'sfd_admin' : undefined)
    }
  };
};

// Fonction pour attribuer le rôle utilisateur
export const assignUserRole = async (userId: string): Promise<Role | null> => {
  try {
    // Utiliser une requête avec une table spécifique pour éviter l'ambiguïté
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_roles.user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error assigning role:', error);
      return null;
    }
    
    if (data?.role) {
      return data.role as Role;
    }
    
    return null;
  } catch (error) {
    console.error('Error assigning role:', error);
    return null;
  }
};
