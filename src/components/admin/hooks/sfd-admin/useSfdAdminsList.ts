
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
        logger.debug(`Chargement des administrateurs pour la SFD: ${sfdId}`);
        
        if (!sfdId) return [];
        
        const { data, error } = await supabase.functions.invoke('fetch-sfd-admins', {
          body: { sfdId }
        });
        
        if (error) {
          logger.error('Erreur lors de l\'appel de la fonction:', error);
          throw new Error(`Erreur de communication avec le serveur: ${error.message}`);
        }
        
        if (!data) return [];
        
        if (data.error) {
          logger.error('Erreur retournée par la fonction:', data.error);
          throw new Error(data.error);
        }
        
        const admins = Array.isArray(data) ? data : [];
        logger.debug(`${admins.length} administrateurs récupérés pour la SFD ${sfdId}`);
        return admins;
      } catch (error) {
        logger.error('Erreur lors de la récupération des administrateurs:', error);
        throw new Error('Impossible de récupérer les administrateurs SFD');
      }
    },
    enabled: !!sfdId,
  });
  
  return { sfdAdmins: data || [], isLoading, error, refetch };
}
