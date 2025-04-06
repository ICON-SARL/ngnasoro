
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User, Role, AuthResponse } from './types';
import { supabase } from '@/integrations/supabase/client';

export const createUserFromSupabaseUser = (supabaseUser?: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || '',
    role: getUserRole(supabaseUser)
  };
};

export const getUserRole = (user?: SupabaseUser | null | User): Role | null => {
  if (!user) return null;
  
  // Check for role property directly on user object
  if ('role' in user && user.role) {
    return user.role;
  }
  
  // Check for role in user_metadata
  if ('user_metadata' in user && user.user_metadata) {
    if (user.user_metadata?.role) {
      return user.user_metadata.role as Role;
    }
  } 
  
  // Check for role in app_metadata
  if ('app_metadata' in user && user.app_metadata) {
    if (user.app_metadata?.role) {
      // Ensure the role string is a valid Role type
      const role = user.app_metadata.role;
      if (['user', 'admin', 'sfd_admin', 'super_admin'].includes(role)) {
        return role as Role;
      }
    }
  } 
  
  return null;
};

export const isUserAdmin = (user?: User | null): boolean => {
  return user?.role === 'admin' || user?.app_metadata?.role === 'admin';
};

export const isUserSfdAdmin = (user?: User | null): boolean => {
  return user?.role === 'sfd_admin' || user?.app_metadata?.role === 'sfd_admin';
};

// Fonction pour assigner la SFD "Test" lors de la création d'un nouveau compte
export const assignDefaultSfd = async (userId: string): Promise<void> => {
  try {
    // Récupérer l'ID de la SFD "Test"
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .select('id')
      .eq('name', 'Test')
      .single();
    
    if (sfdError || !sfdData) {
      console.error("Erreur lors de la récupération de la SFD Test:", sfdError);
      return;
    }
    
    // Assigner la SFD à l'utilisateur
    const { error } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id: sfdData.id,
        is_default: true
      });
    
    if (error) {
      console.error("Erreur lors de l'assignation de la SFD:", error);
    }
  } catch (err) {
    console.error("Une erreur est survenue:", err);
  }
};

// Fonction pour créer un client SFD
export const createSfdClient = async (
  sfdId: string, 
  fullName: string, 
  email?: string, 
  phone?: string,
  userId?: string
): Promise<{success: boolean, client?: any, error?: string}> => {
  try {
    const { data, error } = await supabase
      .from('sfd_clients')
      .insert({
        sfd_id: sfdId,
        user_id: userId || null,
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        status: 'pending',
        kyc_level: 0
      })
      .select()
      .single();
      
    if (error) {
      return {success: false, error: error.message};
    }
    
    return {success: true, client: data};
  } catch (err: any) {
    return {success: false, error: err.message};
  }
};
