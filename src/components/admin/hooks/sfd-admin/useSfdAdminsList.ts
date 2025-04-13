import { useQuery } from '@tanstack/react-query';
import { getSfdAdmins, getSfdAdminsForSfd, SfdAdmin } from './sfdAdminApiService';
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
    queryFn: async () => {
      try {
        console.log(`Chargement des administrateurs SFD${sfdId ? ' pour la SFD ' + sfdId : ''}...`);
        // Ajouter un délai pour éviter des problèmes de race condition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If sfdId is provided, use the specific function to get admins for that SFD
        // Otherwise get all SFD admins
        const admins = sfdId 
          ? await getSfdAdminsForSfd(sfdId)
          : await getSfdAdmins();
        
        // Vérifier que le résultat est bien un tableau (défense contre les erreurs de format)
        if (!Array.isArray(admins)) {
          console.warn('Résultat inattendu de getSfdAdmins:', admins);
          return [];
        }
        
        return admins;
      } catch (error: any) {
        console.error('Erreur dans useSfdAdminsList:', error);
        toast({
          title: "Erreur",
          description: `Impossible de charger les administrateurs: ${error.message}`,
          variant: "destructive",
        });
        // Retourner un tableau vide en cas d'erreur pour éviter des problèmes d'affichage
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Nombre de tentatives
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Délai exponentiel avec max 30 secondes
    // Utilisez ce résultat fallback pour éviter null/undefined
    placeholderData: []
  });

  return {
    sfdAdmins: Array.isArray(sfdAdmins) ? sfdAdmins : [],
    isLoading,
    error,
    refetch
  };
}
