
import { useQuery } from '@tanstack/react-query';
import { fetchSfdAdmins, fetchSfdAdminsForSfd } from './sfdAdminApiService';
import { useToast } from '@/hooks/use-toast';

export function useSfdAdminsList(sfdId?: string) {
  const { toast } = useToast();
  
  const {
    data: sfdAdmins,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: sfdId ? ['sfd-admins', sfdId] : ['sfd-admins'],
    queryFn: () => sfdId ? fetchSfdAdminsForSfd(sfdId) : fetchSfdAdmins(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Augmenter le nombre de tentatives
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Délai exponentiel avec un max de 30 secondes
    meta: {
      onSettled: (data, error) => {
        if (error) {
          console.error('Erreur lors de la récupération des administrateurs SFD:', error);
          toast({
            title: "Erreur",
            description: `Impossible de charger les administrateurs: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    }
  });

  return {
    sfdAdmins: sfdAdmins || [],
    isLoading,
    error,
    refetch
  };
}
