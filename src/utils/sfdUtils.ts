
import { supabase } from '@/integrations/supabase/client';

/**
 * Vérifie si une SFD a des associations d'administrateurs
 * @param sfdId L'identifiant de la SFD à vérifier
 * @returns true si la SFD a au moins un administrateur associé
 */
export const verifySfdHasAdmins = async (sfdId: string): Promise<boolean> => {
  try {
    // Vérifie les associations dans user_sfds pour les utilisateurs avec rôle sfd_admin
    const { data, error } = await supabase
      .from('user_sfds')
      .select(`
        user_id,
        users:user_id (
          id,
          user_roles!user_roles(
            role
          )
        )
      `)
      .eq('sfd_id', sfdId);

    if (error) {
      console.error('Error verifying SFD admins:', error);
      return false;
    }

    // Vérifier si l'un des utilisateurs a le rôle sfd_admin
    const hasAdminUser = data?.some(item => 
      item.users?.user_roles?.some((r: any) => r.role === 'sfd_admin')
    );

    return !!hasAdminUser;
  } catch (error) {
    console.error('Exception verifying SFD admins:', error);
    return false;
  }
};

/**
 * Récupère toutes les SFDs actives de la base de données
 */
export const fetchActiveSfds = async () => {
  try {
    console.log('Fetching active SFDs from database');
    
    const { data, error } = await supabase
      .from('sfds')
      .select('id, name, code, region, status, logo_url, description')
      .eq('status', 'active');
      
    if (error) {
      console.error('Error fetching SFDs:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} active SFDs from database`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchActiveSfds:', error);
    return [];
  }
};

/**
 * Récupère toutes les SFDs depuis l'edge function
 */
export const fetchSfdsFromEdgeFunction = async (userId?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-available-sfds', {
      body: { userId }
    });
    
    if (error) {
      console.error('Error fetching SFDs from edge function:', error);
      return [];
    }
    
    console.log(`Fetched ${data?.length || 0} SFDs from Edge function`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchSfdsFromEdgeFunction:', error);
    return [];
  }
};

/**
 * Corrige les données des SFDs pour assurer la compatibilité avec les composants
 */
export const normalizeSfdData = (sfds: any[]): any[] => {
  if (!Array.isArray(sfds) || sfds.length === 0) return [];
  
  return sfds.map(sfd => ({
    id: sfd.id || `unknown-${Math.random().toString(36).substring(7)}`,
    name: sfd.name || 'SFD Sans Nom',
    code: sfd.code || 'CODE',
    region: sfd.region || undefined,
    status: sfd.status || 'active',
    logo_url: sfd.logo_url || null,
    description: sfd.description || undefined
  }));
};
