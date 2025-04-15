
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './roleTypes';

/**
 * Utilitaire pour vérifier l'état des permissions
 */
export async function verifyPermissionSystem(): Promise<{
  success: boolean;
  viewExists: boolean;
  roleCount: number;
  edgeFunctionWorks: boolean;
  message: string;
}> {
  try {
    // 1. Vérifier l'existence de la vue de permissions
    // Using a direct table query instead of an RPC function that doesn't exist
    const { data: viewData, error: viewError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('tablename', 'role_permissions_view')
      .single();
    
    const viewExists = viewData !== null;
    
    // 2. Vérifier le fonctionnement de l'edge function
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('test-roles', {
      body: JSON.stringify({
        action: 'verify_permissions',
        role: 'admin'
      })
    });
    
    const edgeFunctionWorks = !edgeError && edgeData?.permissions && Array.isArray(edgeData.permissions);
    
    // 3. Compter les rôles existants
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .order('role');
    
    const roleCount = roleData?.length || 0;
    
    // Résultat final
    const success = viewExists && edgeFunctionWorks;
    let message = success 
      ? 'Le système de permissions fonctionne correctement' 
      : 'Des problèmes ont été détectés avec le système de permissions';
    
    if (!viewExists) {
      message += '\n- La vue role_permissions_view n\'existe pas dans la base de données';
    }
    
    if (!edgeFunctionWorks) {
      message += '\n- La fonction Edge test-roles ne fonctionne pas correctement';
      if (edgeError) {
        message += `: ${edgeError.message}`;
      }
    }
    
    return {
      success,
      viewExists,
      roleCount,
      edgeFunctionWorks,
      message
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du système de permissions:', error);
    return {
      success: false,
      viewExists: false,
      roleCount: 0,
      edgeFunctionWorks: false,
      message: `Erreur lors de la vérification: ${error.message}`
    };
  }
}

/**
 * Vérifie si un utilisateur a le rôle spécifié
 */
export async function verifyUserRole(userId: string): Promise<{
  role: string;
  permissions: string[];
  hasPermissions: boolean;
}> {
  try {
    // 1. Obtenir le rôle de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (userError) {
      throw new Error(`Erreur lors de la récupération du rôle: ${userError.message}`);
    }
    
    const role = userData?.role || 'user';
    
    // 2. Obtenir les permissions pour ce rôle
    const { data: permData, error: permError } = await supabase.functions.invoke('test-roles', {
      body: JSON.stringify({
        action: 'verify_permissions',
        role
      })
    });
    
    if (permError) {
      throw new Error(`Erreur lors de la récupération des permissions: ${permError.message}`);
    }
    
    const permissions = permData?.permissions || [];
    
    return {
      role,
      permissions,
      hasPermissions: permissions.length > 0
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle utilisateur:', error);
    return {
      role: 'unknown',
      permissions: [],
      hasPermissions: false
    };
  }
}
