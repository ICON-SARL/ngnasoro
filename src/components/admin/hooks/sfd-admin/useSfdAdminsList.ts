
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
  last_sign_in_at: string | null;
}

export function useSfdAdminsList(sfdId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-admins', sfdId],
    queryFn: async (): Promise<SfdAdmin[]> => {
      try {
        console.log(`Chargement des administrateurs pour la SFD: ${sfdId}`);
        
        if (!sfdId) {
          console.log('Aucun SFD ID fourni, retour d\'un tableau vide');
          return [];
        }
        
        // Récupérer les administrateurs associés à cette SFD via user_sfds
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('user_id')
          .eq('sfd_id', sfdId);
          
        if (userSfdsError) {
          console.error('Erreur lors de la récupération des associations:', userSfdsError);
          throw new Error(`Erreur lors de la récupération des associations: ${userSfdsError.message}`);
        }
        
        if (!userSfds || userSfds.length === 0) {
          console.log(`Aucun administrateur associé à la SFD ${sfdId}`);
          return [];
        }
        
        // Extraire les IDs des utilisateurs
        const userIds = userSfds.map(item => item.user_id);
        
        // Récupérer les détails des administrateurs
        const { data: admins, error: adminsError } = await supabase
          .from('admin_users')
          .select('id, email, full_name, role, has_2fa, last_sign_in_at')
          .in('id', userIds);
          
        if (adminsError) {
          console.error('Erreur lors de la récupération des administrateurs:', adminsError);
          throw new Error(`Erreur lors de la récupération des administrateurs: ${adminsError.message}`);
        }
        
        console.log(`${admins?.length || 0} administrateurs récupérés avec succès pour la SFD ${sfdId}`);
        return admins || [];
      } catch (error: any) {
        console.error('Erreur lors de la récupération des administrateurs:', error);
        throw new Error('Impossible de récupérer les administrateurs SFD');
      }
    },
    enabled: !!sfdId,
  });
  
  return {
    sfdAdmins: data || [],
    isLoading,
    error,
    refetch
  };
}
