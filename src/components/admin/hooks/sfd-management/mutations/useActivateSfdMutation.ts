
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useActivateSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sfdId: string) => {
      try {
        console.log('Activating SFD:', sfdId);
        const { data, error } = await supabase
          .from('sfds')
          .update({ status: 'active' })
          .eq('id', sfdId)
          .select()
          .single();

        if (error) throw error;
        console.log('SFD activated successfully:', data);
        return data;
      } catch (error: any) {
        console.error('Error activating SFD:', error);
        throw new Error(error.message || 'Une erreur est survenue lors de l\'activation de la SFD');
      }
    },
    onSuccess: () => {
      // Invalider TOUTES les requêtes qui dépendent des données SFD
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['user-sfds'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      // Ajouter également l'invalidation du compteur sur le tableau de bord
      queryClient.invalidateQueries({ queryKey: ['sfd-management-stats'] });
      
      toast({
        title: 'SFD activée',
        description: 'La SFD a été activée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'activation de la SFD',
        variant: 'destructive',
      });
    },
  });
}
