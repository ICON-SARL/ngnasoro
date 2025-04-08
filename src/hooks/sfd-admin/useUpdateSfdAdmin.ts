
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUpdateSfdAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateSfdAdmin = useMutation({
    mutationFn: async (data: {
      adminId: string;
      role: string;
      has2FA?: boolean;
      is_active?: boolean;
    }) => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Updating admin role:", data);
        
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ role: data.role })
          .eq('id', data.adminId);
          
        if (updateError) {
          console.error("Error updating admin role:", updateError);
          throw updateError;
        }
        
        if (data.role !== 'sfd_admin') {
          const { error: removeRoleError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', data.adminId)
            .eq('role', 'sfd_admin');
            
          if (removeRoleError) {
            console.warn("Error removing old role:", removeRoleError);
          }
          
          const { error: addRoleError } = await supabase.rpc(
            'assign_role',
            {
              user_id: data.adminId,
              role: data.role as "admin" | "sfd_admin" | "user"
            }
          );
          
          if (addRoleError) {
            console.error("Error assigning new role:", addRoleError);
            throw addRoleError;
          }
        }
        
        try {
          await supabase.auth.admin.updateUserById(
            data.adminId,
            { app_metadata: { role: data.role } }
          );
        } catch (metaError) {
          console.warn("Could not update user metadata:", metaError);
        }
        
        return { success: true };
      } catch (error: any) {
        console.error("Error updating SFD admin:", error);
        setError(error.message || "An error occurred while updating the administrator");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      
      toast({
        title: "Success",
        description: "Administrator role has been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Unable to update the administrator: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    updateSfdAdmin: updateSfdAdmin.mutate,
    isLoading,
    error
  };
}
