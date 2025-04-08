
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
        console.log("Starting SFD admin creation process", {
          ...data,
          password: "***" // Mask password in logs
        });
        
        if (!user) {
          throw new Error("Vous devez être connecté pour effectuer cette action");
        }
        
        // Call edge function to create the admin user
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
        
        // Return the response, including the user_id for notification purposes
        return {
          ...response,
          user_id: response.user_id,
          email: data.email,
        };
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
