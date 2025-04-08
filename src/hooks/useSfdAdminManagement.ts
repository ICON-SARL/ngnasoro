
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
  
  // Mutation to add an SFD admin
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
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', data.email)
          .single();
        
        if (existingUser) {
          throw new Error("This email is already registered. Please use a different email.");
        }
        
        // 1. Create a user using Supabase's public API
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              role: 'sfd_admin',
              sfd_id: data.sfd_id
            }
          }
        });

        if (signUpError) {
          console.error("Error signing up user:", signUpError);
          throw signUpError;
        }
        
        if (!signUpData.user) {
          throw new Error("No user created");
        }

        console.log("User created successfully:", signUpData.user.id);

        // 2. Create entry in admin_users
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert({
            id: signUpData.user.id,
            email: data.email,
            full_name: data.full_name,
            role: 'sfd_admin',
            has_2fa: false
          });

        if (adminError) {
          console.error("Error creating admin user record:", adminError);
          throw adminError;
        }

        console.log("Admin user record created successfully");

        // 3. Assign SFD_ADMIN role
        const { error: roleError } = await supabase.rpc(
          'assign_role',
          {
            user_id: signUpData.user.id,
            role: 'sfd_admin'
          }
        );

        if (roleError) {
          console.error("Error assigning role:", roleError);
          throw roleError;
        }

        console.log("SFD admin role assigned successfully");
        
        // 4. Send notification to admin if requested
        if (data.notify && user) {
          try {
            await sendNotification({
              title: "SFD admin account created",
              message: `An admin account has been created for you. Please log in with the email ${data.email}.`,
              type: "info",
              recipient_id: signUpData.user.id
            });
            console.log("Notification sent successfully");
          } catch (notifError) {
            console.warn("Unable to send notification:", notifError);
            // Continue even if notification fails
          }
        }
        
        // 5. Return the created user data
        return signUpData.user;
        
      } catch (error: any) {
        console.error("Error creating SFD admin:", error);
        setError(error.message || "An error occurred while creating the administrator");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      // Invalidate queries to force data refresh
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      
      toast({
        title: "Success",
        description: "The SFD administrator has been successfully created",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Unable to create the administrator: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update SFD admin role
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
        
        // Update the admin_users table
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ role: data.role })
          .eq('id', data.adminId);
          
        if (updateError) {
          console.error("Error updating admin role:", updateError);
          throw updateError;
        }
        
        // Also update the user_roles table if needed
        if (data.role !== 'sfd_admin') {
          // Remove the old role
          const { error: removeRoleError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', data.adminId)
            .eq('role', 'sfd_admin');
            
          if (removeRoleError) {
            console.warn("Error removing old role:", removeRoleError);
            // Continue despite error
          }
          
          // Add the new role
          const { error: addRoleError } = await supabase.rpc(
            'assign_role',
            {
              user_id: data.adminId,
              role: data.role
            }
          );
          
          if (addRoleError) {
            console.error("Error assigning new role:", addRoleError);
            throw addRoleError;
          }
        }
        
        // Update the auth.users metadata if possible
        try {
          await supabase.auth.admin.updateUserById(
            data.adminId,
            { app_metadata: { role: data.role } }
          );
        } catch (metaError) {
          console.warn("Could not update user metadata:", metaError);
          // Continue despite error
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

  // Delete an SFD admin
  const deleteSfdAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Deleting SFD admin:", adminId);
        
        // Call the edge function to delete the admin
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
