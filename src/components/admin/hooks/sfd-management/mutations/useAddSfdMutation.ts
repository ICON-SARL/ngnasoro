
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { supabase } from '@/integrations/supabase/client';

export function useAddSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sfdData: SfdFormValues) => {
      if (!user) {
        throw new Error("Vous devez être connecté pour ajouter une SFD");
      }

      // Préparer les données pour l'insertion
      const newSfd = {
        name: sfdData.name,
        code: sfdData.code,
        region: sfdData.region || null,
        status: sfdData.status || 'active',
        logo_url: sfdData.logo_url || null,
        phone: sfdData.phone || null,
        subsidy_balance: sfdData.subsidy_balance || 0
      };

      try {
        console.log("Tentative de création de SFD avec les données:", newSfd);
        console.log("Admin ID utilisé:", user.id);
        
        // Supprimer tout cache existant avant l'opération
        queryClient.removeQueries({ queryKey: ['sfds'] });
        
        // Ajouter un paramètre anti-cache
        const timestamp = new Date().getTime();
        
        // Utiliser directement l'API Supabase pour appeler la fonction Edge
        const { data: responseData, error: fnError } = await supabase.functions.invoke('create_sfd', {
          body: {
            sfd_data: newSfd,
            admin_id: user.id,
            timestamp // Ajouter un horodatage pour éviter le cache
          },
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        if (fnError) {
          console.error("Erreur lors de l'appel à la fonction Edge create_sfd:", fnError);
          throw new Error(`Erreur lors de l'ajout de la SFD: ${fnError.message}`);
        }

        if (!responseData || !responseData.success) {
          const errorMsg = responseData?.error || "Échec de la création de la SFD";
          console.error("Échec de la création de la SFD:", errorMsg);
          throw new Error(errorMsg);
        }
        
        const sfdData = responseData.data;
        
        // Make sure we have a proper SFD object with an id
        if (!sfdData || typeof sfdData !== 'object' || !sfdData.id) {
          console.error("Réponse invalide reçue:", sfdData);
          throw new Error("Réponse invalide du serveur lors de la création de la SFD");
        }
        
        console.log("SFD créée avec succès:", sfdData);

        // Force un rafraîchissement immédiat des données de SFD
        queryClient.invalidateQueries({ queryKey: ['sfds'] });

        return {
          sfd: sfdData,
          hasSubsidy: newSfd.subsidy_balance > 0
        };
      } catch (error: any) {
        console.error("Erreur critique lors de l'ajout de la SFD:", error);
        
        // Provide more detailed error message to the user
        let errorMessage = "Une erreur est survenue lors de la création de la SFD";
        
        if (error.message) {
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('NetworkError') ||
              error.message.includes('Failed to send')) {
            errorMessage = "Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.";
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      // Clear cache and invalidate queries
      queryClient.removeQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      
      // Force refetch immediately
      setTimeout(() => {
        console.log("Delayed refetch to ensure server consistency");
        queryClient.refetchQueries({ queryKey: ['sfds'] });
      }, 500);
      
      toast({
        title: 'SFD ajoutée',
        description: 'La nouvelle SFD a été ajoutée avec succès.',
      });

      if (user && data.sfd) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: data.sfd.id },
          status: 'success',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
    },
  });
}
