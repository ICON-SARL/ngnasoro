
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
      // Appeler la Edge Function pour récupérer les administrateurs SFD
      const { data, error } = await supabase.functions.invoke('fetch-sfd-admins', {
        body: JSON.stringify({ sfdId })
      });
      
      if (error) {
        console.error('Erreur lors de la récupération des administrateurs:', error);
        throw new Error('Impossible de récupérer les administrateurs SFD');
      }
      
      return data || [];
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
