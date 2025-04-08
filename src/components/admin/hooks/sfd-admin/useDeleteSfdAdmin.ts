
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDeleteSfdAdmin() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteSfdAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      setIsDeleting(true);
      setError(null);
      
      try {
        // First, remove user from user_sfds table
        const { error: userSfdsError } = await supabase
          .from('user_sfds')
          .delete()
          .eq('user_id', adminId);
        
        if (userSfdsError) {
          console.error('Error removing SFD association:', userSfdsError);
          throw userSfdsError;
        }

        // Then disable the admin user
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ status: 'inactive' })
          .eq('id', adminId);
          
        if (updateError) {
          console.error('Error disabling admin user:', updateError);
          throw updateError;
        }
        
        return true;
      } catch (error: any) {
        console.error('Error deleting SFD admin:', error);
        setError(error.message || "Une erreur est survenue lors de la suppression de l'administrateur");
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    onSuccess: () => {
      // Invalidate the query to refetch the admin list
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      
      toast({
        title: "Succès",
        description: "L'administrateur a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'administrateur: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    deleteSfdAdmin: deleteSfdAdminMutation.mutate,
    isDeleting,
    error
  };
}
