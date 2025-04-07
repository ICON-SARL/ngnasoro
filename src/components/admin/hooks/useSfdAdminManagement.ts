
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';
import { useAuth } from '@/hooks/auth';
import { AdminRole } from '@/components/admin/management/types';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useSfdAdminManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { sendNotification } = useAdminCommunication();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
        const { data: existingUser, error: checkError } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', data.email)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("Error checking existing user:", checkError);
          throw new Error("Erreur lors de la vérification de l'email");
        }
        
        if (existingUser) {
          throw new Error("Cet email est déjà enregistré. Veuillez utiliser une adresse différente.");
        }
        
        // 1. Create a user using Supabase Auth API
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
          throw new Error("Aucun utilisateur créé");
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
            sfd_id: data.sfd_id,
            has_2fa: false,
            is_active: true
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
            role_name: 'sfd_admin'
          }
        );

        if (roleError) {
          console.error("Error assigning role:", roleError);
          // Don't throw here, attempt to continue even if role assignment fails
          // We'll log this issue instead
          logAuditEvent({
            user_id: user?.id || "",
            action: "assign_role_failed",
            category: AuditLogCategory.ADMIN_OPERATIONS,
            severity: AuditLogSeverity.WARNING,
            details: { target_user: signUpData.user.id, error: roleError.message },
            status: 'failure',
          });
        } else {
          console.log("SFD admin role assigned successfully");
        }
        
        // 4. Send notification to admin if requested
        if (data.notify && signUpData.user.id) {
          try {
            await sendNotification({
              title: "Compte administrateur SFD créé",
              message: `Un compte administrateur a été créé pour vous. Veuillez vous connecter avec l'email ${data.email}.`,
              type: "info",
              recipient_id: signUpData.user.id
            });
            console.log("Notification sent successfully");
          } catch (notifError) {
            console.warn("Unable to send notification:", notifError);
            // Continue even if notification fails
          }
        }
        
        // Log the successful creation
        if (user) {
          logAuditEvent({
            user_id: user.id,
            action: "create_sfd_admin",
            category: AuditLogCategory.ADMIN_OPERATIONS,
            severity: AuditLogSeverity.INFO,
            details: { 
              admin_email: data.email,
              sfd_id: data.sfd_id
            },
            status: 'success',
          });
        }
        
        // 5. Return the created user data
        return signUpData.user;
        
      } catch (error: any) {
        console.error("Error creating SFD admin:", error);
        
        // Log the failed attempt
        if (user) {
          logAuditEvent({
            user_id: user.id,
            action: "create_sfd_admin_failed",
            category: AuditLogCategory.ADMIN_OPERATIONS,
            severity: AuditLogSeverity.ERROR,
            details: { 
              error: error.message,
              sfd_id: data.sfd_id
            },
            status: 'failure',
            error_message: error.message,
          });
        }
        
        setError(error.message || "Une erreur s'est produite lors de la création de l'administrateur");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      // Invalidate queries to force data refresh
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

  return {
    isLoading,
    error,
    addSfdAdmin: addSfdAdminMutation.mutate,
    addSfdAdminAsync: addSfdAdminMutation.mutateAsync
  };
}
