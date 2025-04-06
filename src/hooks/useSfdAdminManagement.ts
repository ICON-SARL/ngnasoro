
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminCommunication } from './useAdminCommunication';
import { useAuth } from './auth';
import { AdminRole } from '@/components/admin/management/types';

export function useSfdAdminManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { sendNotification } = useAdminCommunication();
  const { user } = useAuth();
  
  // Mutation pour ajouter un administrateur SFD
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
      
      try {
        // 1. Créer un utilisateur dans auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            full_name: data.full_name,
            role: data.role,
            sfd_id: data.sfd_id
          }
        });

        if (authError) throw authError;
        
        if (!authData.user) {
          throw new Error("Aucun utilisateur créé");
        }

        // 2. Créer l'entrée dans admin_users
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            has_2fa: false
          });

        if (adminError) throw adminError;

        // 3. Assigner le rôle SFD_ADMIN
        const { error: roleError } = await supabase.rpc(
          'assign_role',
          {
            user_id: authData.user.id,
            role: 'sfd_admin'
          }
        );

        if (roleError) throw roleError;
        
        // 4. Envoyer une notification à l'administrateur si demandé
        if (data.notify && user) {
          await sendNotification({
            title: "Compte administrateur SFD créé",
            message: `Un compte administrateur a été créé pour vous. Veuillez vous connecter avec l'adresse email ${data.email}.`,
            type: "info",
            recipient_id: authData.user.id
          });
        }
        
        // 5. Retourner les données de l'utilisateur créé
        return authData.user;
        
      } catch (error) {
        console.error("Error creating SFD admin:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      // Invalider les requêtes pour forcer un rafraîchissement des données
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
    addSfdAdmin: addSfdAdminMutation.mutate
  };
}
