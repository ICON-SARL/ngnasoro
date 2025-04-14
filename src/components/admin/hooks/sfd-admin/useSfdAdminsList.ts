
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
        
        // Always use the Edge Function to fetch administrators, to bypass RLS issues
        console.log('Utilisation de la fonction Edge pour contourner les problèmes de RLS');
        const { data, error } = await supabase.functions.invoke('fetch-sfd-admins', {
          body: { sfdId }
        });
        
        if (error) {
          console.error('Erreur lors de l\'appel de la fonction:', error);
          throw new Error(`Erreur de communication avec le serveur: ${error.message}`);
        }
        
        if (!data) {
          console.log(`Aucune donnée reçue pour la SFD ${sfdId}`);
          return [];
        }
        
        // Handle potential error returned in data
        if (data.error) {
          console.error('Erreur retournée par la fonction:', data.error);
          throw new Error(data.error);
        }
        
        // If data is an array, it's the admin list
        const admins = Array.isArray(data) ? data : [];
        console.log(`${admins.length} administrateurs récupérés avec succès pour la SFD ${sfdId}`);
        return admins;
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
