
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCreateSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, session } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      sfdData, 
      createAdmin, 
      adminData,
      existingAdminId
    }: { 
      sfdData: any; 
      createAdmin: boolean;
      adminData?: {
        email: string;
        password: string;
        full_name: string;
      };
      existingAdminId?: string;
    }) => {
      console.log("Starting SFD creation process...");
      
      try {
        console.log("Preparing data for submission:", {
          sfdData: { ...sfdData },
          createAdmin,
          hasAdminData: !!adminData,
          hasExistingAdmin: !!existingAdminId,
          user: user ? { id: user.id, role: user.app_metadata?.role } : 'No user'
        });
        
        // Vérification que les données de l'administrateur sont correctes si nécessaire
        if (createAdmin && (!adminData || !adminData.email || !adminData.password || !adminData.full_name)) {
          throw new Error("Les informations de l'administrateur sont incomplètes");
        }
        
        // Verify that we're not trying to use both options at once
        if (createAdmin && existingAdminId) {
          throw new Error("Vous ne pouvez pas à la fois créer un nouvel administrateur et associer un existant");
        }
        
        // Préparer les données pour la requête
        const requestBody = {
          sfdData,
          createAdmin,
          adminData: createAdmin && adminData ? adminData : null,
          existingAdminId: existingAdminId || null
        };
        
        console.log("Sending request to edge function:", JSON.stringify({
          ...requestBody,
          adminData: adminData ? {...adminData, password: "***"} : null
        }));
        
        // Setting timeout for the edge function call
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête a pris trop de temps. Veuillez réessayer plus tard.")), 60000);
        });
        
        try {
          // Build request options with auth header if user is logged in
          const options: any = { body: requestBody };
          
          // Add authentication token if available
          if (session?.access_token) {
            options.headers = {
              Authorization: `Bearer ${session.access_token}`,
            };
            console.log("Added authentication token to request");
          } else {
            console.log("No authentication token available");
          }
          
          // Make the request to the Edge Function
          const responsePromise = supabase.functions.invoke('create-sfd-with-admin', options);
          
          // Race between the request and the timeout
          const { data, error } = await Promise.race([
            responsePromise,
            timeoutPromise.then(() => {
              throw new Error("La requête a pris trop de temps. Veuillez réessayer plus tard.");
            })
          ]) as any;

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
          if (fetchError.message.includes("trop de temps")) {
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
