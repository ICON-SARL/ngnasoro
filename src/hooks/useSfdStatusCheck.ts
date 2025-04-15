
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
        
        return {
          activeSfdsCount: count || 0,
          hasActiveSfds: (count || 0) > 0
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
          hasActiveSfds: false
        };
      }
    },
    refetchInterval: 30000, // Vérifier toutes les 30 secondes
  });
}
