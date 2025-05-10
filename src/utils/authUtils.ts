
import { supabase } from '@/integrations/supabase/client';

/**
 * Nettoie complètement l'état d'authentification pour éviter les problèmes de persistance
 */
export const cleanupAuthState = async () => {
  try {
    // Essayer de se déconnecter globalement (silencieux en cas d'échec)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log('Error during global sign out (ignored):', err);
    }
    
    // Supprimer les tokens standard
    localStorage.removeItem('supabase.auth.token');
    
    // Supprimer tous les clés Supabase auth du localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Supprimer du sessionStorage si utilisé
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('Auth state cleanup completed');
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

/**
 * Réinitialise la session et se reconnecte avec des identifiants fournis
 */
export const resetSessionAndReconnect = async (email: string, password: string) => {
  await cleanupAuthState();
  
  // Se connecter à nouveau
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Error signing in after reset:', error);
    return { success: false, error };
  }
  
  // Forcer la mise à jour complète de la page pour un état propre
  window.location.href = '/mobile-flow/main';
  
  return { success: true, data };
};

/**
 * Vérifie si un utilisateur a un rôle spécifique dans la base de données
 */
export const checkUserHasRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    // Use a type assertion to bypass the strict type check
    // This allows us to query for any role value from the database
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role as any)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Error in checkUserHasRole:', err);
    return false;
  }
};

/**
 * Ajoute un rôle client à l'utilisateur si nécessaire
 */
export const ensureClientRole = async (userId: string): Promise<boolean> => {
  try {
    // Vérifier si le rôle existe déjà
    const hasRole = await checkUserHasRole(userId, 'client');
    if (hasRole) return true;
    
    // Ajouter le rôle client
    // Use a type assertion to bypass the strict type check
    const { error } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: userId, 
        role: 'client' as any
      });
      
    if (error) {
      console.error('Error adding client role:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in ensureClientRole:', err);
    return false;
  }
};
