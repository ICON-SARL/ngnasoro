
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useActivateSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      // Invalidate queries that depend on SFD data
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['user-sfds'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
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
