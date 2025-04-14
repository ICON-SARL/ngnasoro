
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useActivateSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sfdId: string) => {
      try {
        const { data, error } = await supabase
          .from('sfds')
          .update({ status: 'active' })
          .eq('id', sfdId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error activating SFD:', error);
        throw new Error(error.message || 'Une erreur est survenue lors de l\'activation de la SFD');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
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
