
import { useQuery } from '@tanstack/react-query';
import { fetchSfdAdmins } from './sfdAdminApiService';

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
        
        const admins = await fetchSfdAdmins(sfdId);
        console.log(`${admins.length} administrateurs récupérés avec succès pour la SFD ${sfdId}`);
        return admins;
      } catch (error) {
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
