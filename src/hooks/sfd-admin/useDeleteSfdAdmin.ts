
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDeleteSfdAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteSfdAdmin = useMutation({
    mutationFn: async (adminId: string) => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Deleting SFD admin:", adminId);
        
        const { data, error } = await supabase.functions.invoke('delete_sfd_admin', {
          body: { admin_id: adminId }
        });
        
        if (error) {
          console.error("Error calling delete_sfd_admin function:", error);
          throw error;
        }
        
        if (!data.success) {
          throw new Error(data.message || "Failed to delete administrator");
        }
        
        return data;
      } catch (error: any) {
        console.error("Error deleting SFD admin:", error);
        setError(error.message || "An error occurred while deleting the administrator");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      
      toast({
        title: "Success",
        description: "Administrator has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Unable to delete the administrator: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    deleteSfdAdmin: deleteSfdAdmin.mutate,
    isLoading,
    error
  };
}
