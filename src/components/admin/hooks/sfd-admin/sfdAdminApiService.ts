
import { supabase } from '@/integrations/supabase/client';

export interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
  last_sign_in_at: string | null;
}

export const sfdAdminApiService = {
  fetchSfdAdmins: async (sfdId: string): Promise<SfdAdmin[]> => {
    try {
      console.log(`Récupération des administrateurs pour la SFD: ${sfdId}`);
      
      // Récupérer directement les administrateurs avec le rôle sfd_admin
      // Au lieu d'utiliser Edge Function qui semble échouer
      const { data: allAdmins, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, has_2fa, last_sign_in_at')
        .eq('role', 'sfd_admin');
      
      if (error) {
        // Si la requête directe échoue, essayons une approche alternative
        if (error.message.includes('recursion detected')) {
          console.log('Détection de récursion dans la politique, essai d\'une méthode alternative');
          
          // Récupérer via la fonction edge (plus sécurisée en cas de problèmes avec les politiques RLS)
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('fetch-admin-users');
          
          if (edgeError) {
            throw new Error(`Erreur lors de la récupération via Edge Function: ${edgeError.message}`);
          }
          
          // Filtrer pour ne garder que les admin_sfd
          const sfdAdmins = edgeData.filter((admin: any) => admin.role === 'sfd_admin');
          console.log(`Récupéré ${sfdAdmins.length} admins via Edge Function`);
          
          // Utiliser ces données
          return sfdAdmins;
        }
        
        throw error;
      }
      
      console.log(`Récupéré ${allAdmins?.length || 0} administrateurs au total`);
      return allAdmins || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des administrateurs:', error);
      throw new Error('Impossible de récupérer les administrateurs SFD');
    }
  }
};

// Export the individual functions for direct import
export const { fetchSfdAdmins } = sfdAdminApiService;
