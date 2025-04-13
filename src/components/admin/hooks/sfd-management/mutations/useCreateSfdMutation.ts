
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCreateSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      sfdData, 
      createAdmin, 
      adminData 
    }: { 
      sfdData: any; 
      createAdmin: boolean;
      adminData?: {
        email: string;
        password: string;
        full_name: string;
      }
    }) => {
      console.log("Starting SFD creation process...");
      
      if (!user) {
        throw new Error("Vous devez être connecté pour ajouter une SFD");
      }

      try {
        console.log("Preparing data for submission:", {
          sfdData: { ...sfdData },
          createAdmin,
          hasAdminData: !!adminData
        });
        
        // Vérification que les données de l'administrateur sont correctes si nécessaire
        if (createAdmin && (!adminData || !adminData.email || !adminData.password || !adminData.full_name)) {
          throw new Error("Les informations de l'administrateur sont incomplètes");
        }
        
        // Préparer les données pour la requête
        const requestBody = {
          sfdData,
          createAdmin,
          adminData: createAdmin && adminData ? adminData : null
        };
        
        console.log("Sending request to edge function:", JSON.stringify({
          ...requestBody,
          adminData: adminData ? {...adminData, password: "***"} : null
        }));
        
        // Setting timeout for the edge function call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
        
        try {
          // Make the request to the Edge Function with proper auth token
          const { data, error } = await supabase.functions.invoke('create-sfd-with-admin', {
            body: requestBody,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (error) {
            console.error("Edge Function invocation error:", error);
            throw new Error(`Erreur de communication avec le serveur: ${error.message}`);
          }
          
          console.log("Edge Function response:", data);
          
          if (data?.error) {
            console.error("Edge Function returned error:", data.error);
            throw new Error(data.error);
          }
          
          if (!data?.sfd) {
            console.error("Invalid response from Edge Function:", data);
            throw new Error("Réponse invalide du serveur");
          }
          
          console.log("SFD created successfully:", data.sfd);
          
          return {
            sfd: data.sfd,
            admin: data.admin
          };
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            throw new Error("La requête a pris trop de temps. Veuillez réessayer plus tard.");
          }
          
          throw fetchError;
        }
      } catch (error: any) {
        console.error("Error during SFD creation:", error);
        throw new Error(error.message || "Une erreur est survenue lors de la création de la SFD");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-management-stats'] });
      
      toast({
        title: 'SFD ajoutée',
        description: data.admin 
          ? 'La nouvelle SFD et son administrateur ont été ajoutés avec succès.' 
          : 'La nouvelle SFD a été ajoutée avec succès.',
      });
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      
      toast({
        title: 'Erreur',
        description: `${error.message}`,
        variant: 'destructive',
      });
    },
    retry: 0, // Disable automatic retries
  });
}
