
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
        const { count, error } = await supabase
          .from('sfds')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
          
        if (error) throw error;
        
        console.log(`Nombre de SFDs actives détecté: ${count}`);
        
        // Vérifions également les SFDs associées aux administrateurs
        const { data: sfdAdmins, error: adminError } = await supabase
          .from('sfd_administrators')
          .select('sfd_id, status')
          .eq('status', 'active');
          
        if (adminError) {
          console.error('Erreur lors de la vérification des administrateurs SFD:', adminError);
        } else {
          console.log(`Nombre d'administrateurs SFD actifs: ${sfdAdmins?.length || 0}`);
        }
        
        return {
          activeSfdsCount: count || 0,
          hasActiveSfds: (count || 0) > 0,
          sfdAdmins: sfdAdmins || []
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
          sfdAdmins: []
        };
      }
    },
    refetchInterval: 15000, // Vérifier plus fréquemment (toutes les 15 secondes)
    refetchOnWindowFocus: true, // Rafraîchir lors du focus de fenêtre
  });
}
