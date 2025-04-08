import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminCommunication } from './useAdminCommunication';
import { useAuth } from './auth';
import { AdminRole } from '@/components/admin/management/types';

export function useSfdAdminManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { sendNotification } = useAdminCommunication();
  const { user } = useAuth();
  
  const addSfdAdminMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      full_name: string;
      role: string;
      sfd_id: string;
      notify: boolean;
    }) => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Starting SFD admin creation process", data);
        
        const { data: response, error: edgeFunctionError } = await supabase.functions.invoke(
          'create_admin_user',
          {
            body: {
              email: data.email,
              password: data.password,
              full_name: data.full_name,
              role: 'sfd_admin',
              sfd_id: data.sfd_id
            }
          }
        );
        
        if (edgeFunctionError) {
          console.error("Edge function error:", edgeFunctionError);
          throw new Error(`Edge function error: ${edgeFunctionError.message}`);
        }
        
        if (!response.success) {
          throw new Error(response.error || "Failed to create SFD admin");
        }
        
        console.log("SFD admin created successfully:", response);
        
        if (data.notify && response.user_id && user) {
          try {
            await sendNotification({
              title: "SFD admin account created",
              message: `An admin account has been created for you. Please log in with the email ${data.email}.`,
              type: "info",
              recipient_id: response.user_id
            });
            console.log("Notification sent successfully");
          } catch (notifError) {
            console.warn("Unable to send notification:", notifError);
          }
        }
        
        return response;
        
      } catch (error: any) {
        console.error("Error creating SFD admin:", error);
        setError(error.message || "An error occurred while creating the administrator");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'administrateur: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateSfdAdminMutation = useMutation({
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

  const deleteSfdAdminMutation = useMutation({
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
    isLoading,
    error,
    addSfdAdmin: addSfdAdminMutation.mutate,
    updateSfdAdmin: updateSfdAdminMutation.mutate,
    deleteSfdAdmin: deleteSfdAdminMutation.mutate
  };
}
