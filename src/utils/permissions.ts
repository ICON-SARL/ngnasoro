
import { supabase } from '@/integrations/supabase/client';

/**
 * Obtient toutes les permissions pour un rôle spécifique
 */
export async function getRolePermissions(role: string): Promise<string[]> {
  try {
    // Utiliser la fonction Edge pour récupérer les permissions
    const { data, error } = await supabase.functions.invoke('test-roles', {
      body: JSON.stringify({
        action: 'verify_permissions',
        role
      })
    });
    
    if (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      return [];
    }
    
    return data?.permissions || [];
  } catch (err) {
    console.error('Erreur dans getRolePermissions:', err);
    return [];
  }
}

/**
 * Vérifie si une permission spécifique est accordée pour un utilisateur
 */
export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  try {
    // Utiliser la fonction Edge pour vérifier la permission
    const { data, error } = await supabase.functions.invoke('test-roles', {
      body: JSON.stringify({
        action: 'check_permission',
        userId,
        permission
      })
    });
    
    if (error) {
      console.error('Erreur lors de la vérification de la permission:', error);
      return false;
    }
    
    return data?.has_permission || false;
  } catch (err) {
    console.error('Erreur dans checkPermission:', err);
    return false;
  }
}
