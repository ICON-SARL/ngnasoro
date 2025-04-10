
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
        
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            full_name: data.full_name,
            sfd_id: data.sfd_id
          },
          app_metadata: {
            role: 'sfd_admin'
          }
        });

        if (authError) {
          console.error("Error creating auth user:", authError);
          throw authError;
        }
        
        if (!authData.user) {
          throw new Error("No user created");
        }

        console.log("User created successfully:", authData.user.id);

        // 2. Create entry in admin_users via direct insert
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert({
            id: authData.user.id,
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
            user_id: authData.user.id,
            role: 'sfd_admin'
          }
        );

        if (roleError) {
          console.error("Error assigning role:", roleError);
          throw roleError;
        }

        console.log("SFD admin role assigned successfully");
        
        // 4. Create association with SFD
        const { error: assocError } = await supabase
          .from('user_sfds')
          .insert({
            user_id: authData.user.id,
            sfd_id: data.sfd_id,
            is_default: true
          });
          
        if (assocError) {
          console.error("Error creating SFD association:", assocError);
          throw assocError;
        }
        
        console.log("SFD association created successfully");
        
        // 5. Send notification to admin if requested
        if (data.notify && user) {
          try {
            await sendNotification({
              title: "SFD admin account created",
              message: `An admin account has been created for you. Please log in with the email ${data.email}.`,
              type: "info",
              recipient_id: authData.user.id
            });
            console.log("Notification sent successfully");
          } catch (notifError) {
            console.warn("Unable to send notification:", notifError);
            // Continue even if notification fails
          }
        }
        
        // 6. Return the created user data
        return authData.user;
        
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

  return {
    isLoading,
    error,
    addSfdAdmin: addSfdAdminMutation.mutate
  };
}
