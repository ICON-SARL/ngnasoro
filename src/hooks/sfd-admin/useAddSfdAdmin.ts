
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';

export function useAddSfdAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const addSfdAdmin = useMutation({
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
          throw new Error(`Erreur de fonction: ${edgeFunctionError.message}`);
        }
        
        if (!response || !response.success) {
          console.error("Invalid response:", response);
          throw new Error(response?.error || "Échec de la création de l'administrateur SFD");
        }
        
        console.log("SFD admin created successfully:", response);
        
        if (data.notify && response.user_id && user) {
          try {
            // This will be imported from useAdminCommunication in the main hook
            await sendNotification({
              title: "Compte administrateur SFD créé",
              message: `Un compte administrateur a été créé pour vous. Veuillez vous connecter avec l'email ${data.email}.`,
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
        setError(error.message || "Une erreur est survenue lors de la création de l'administrateur");
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

  return {
    addSfdAdmin: addSfdAdmin.mutate,
    isLoading,
    error
  };
}
