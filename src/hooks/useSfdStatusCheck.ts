
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useSfdStatusCheck() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['sfd-status-check'],
    queryFn: async () => {
      try {
        // Vérifier s'il y a des SFDs avec le statut 'active'
        const { data: activeSfds, error: sfdsError } = await supabase
          .from('sfds')
          .select('id')
          .eq('status', 'active');
          
        if (sfdsError) throw sfdsError;
        
        const count = activeSfds?.length || 0;
        console.log(`Nombre de SFDs actives détecté: ${count}`);
        
        // sfd_administrators table doesn't exist, skip this check
        const sfdAdmins: any[] = [];

        // Récupérer les associations utilisateur-SFD
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('*');

        if (userSfdsError) {
          console.error('Erreur lors de la vérification des associations user-SFD:', userSfdsError);
        } else {
          console.log(`Nombre d'associations utilisateur-SFD: ${userSfds?.length || 0}`);
        }
        
        return {
          activeSfdsCount: count,
          hasActiveSfds: count > 0,
          sfdAdmins: sfdAdmins || [],
          userSfds: userSfds || []
        };
      } catch (error: any) {
        console.error('Error checking SFD status:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de vérifier le statut des SFDs',
          variant: 'destructive',
        });
        return {
          activeSfdsCount: 0,
          hasActiveSfds: false,
          sfdAdmins: [],
          userSfds: []
        };
      }
    },
    refetchInterval: 15000, // Vérifier plus fréquemment (toutes les 15 secondes)
    refetchOnWindowFocus: true, // Rafraîchir lors du focus de fenêtre
  });
}
