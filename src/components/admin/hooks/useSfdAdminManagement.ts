
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';
import { useAuth } from '@/hooks/auth';
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

        if (signUpError) throw signUpError;
        
        if (!signUpData.user) {
          throw new Error("No user created");
        }

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

        if (adminError) throw adminError;

        // 3. Assign SFD_ADMIN role
        const { error: roleError } = await supabase.rpc(
          'assign_role',
          {
            user_id: signUpData.user.id,
            role: 'sfd_admin'
          }
        );

        if (roleError) throw roleError;
        
        // 4. Send notification to admin if requested
        if (data.notify && user) {
          try {
            await sendNotification({
              title: "SFD admin account created",
              message: `An admin account has been created for you. Please log in with the email ${data.email}.`,
              type: "info",
              recipient_id: signUpData.user.id
            });
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

  // Now let's modify this to return a Promise<void> function that matches what AddSfdAdminDialog expects
  const addSfdAdmin = async (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify: boolean;
  }): Promise<void> => {
    try {
      await addSfdAdminMutation.mutateAsync(data);
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error("Error in addSfdAdmin:", error);
    }
  };

  return {
    isLoading,
    error,
    addSfdAdmin
  };
}
