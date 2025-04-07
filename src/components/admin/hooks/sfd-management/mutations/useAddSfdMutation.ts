
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

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
        contact_email: sfdData.contact_email || null,
        phone: sfdData.phone || null,
        legal_document_url: sfdData.legal_document_url || null,
      };

      try {
        // 1. Création de la SFD avec appel à la fonction edge
        console.log("Tentative de création de SFD...");
        const sfdResponse = await edgeFunctionApi.callEdgeFunction('create_sfd', {
          sfd_data: newSfd,
          admin_id: user.id
        });

        if (!sfdResponse) {
          console.error("Aucune réponse reçue lors de la création de la SFD");
          throw new Error("Erreur lors de l'ajout de la SFD");
        }
        
        // Make sure we have a proper SFD object with an id
        if (typeof sfdResponse !== 'object' || !sfdResponse.id) {
          console.error("Réponse invalide reçue:", sfdResponse);
          throw new Error("Réponse invalide du serveur lors de la création de la SFD");
        }
        
        console.log("SFD créée avec succès:", sfdResponse);
        
        // 3. Si nous avons une subvention initiale, créons-la
        if (sfdData.subsidy_balance && sfdData.subsidy_balance > 0) {
          console.log("Création de la subvention initiale...");
          
          const subsidyData = {
            sfd_id: sfdResponse.id,
            amount: parseFloat(String(sfdData.subsidy_balance)),
            remaining_amount: parseFloat(String(sfdData.subsidy_balance)),
            allocated_by: user.id,
            status: 'active',
            description: 'Subvention initiale lors de la création de la SFD'
          };

          const subsidyResponse = await edgeFunctionApi.callEdgeFunction('create_sfd_subsidy', {
            subsidy_data: subsidyData
          });

          if (!subsidyResponse) {
            console.warn("Erreur lors de la création de la subvention initiale");
            // Nous continuons malgré l'erreur de subvention
          } else {
            console.log("Subvention créée avec succès:", subsidyResponse);
          }
        }

        return {
          sfd: sfdResponse,
          hasSubsidy: sfdData.subsidy_balance && sfdData.subsidy_balance > 0
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
      // Invalidate both 'sfds' query and specific SFD query if needed
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      
      // Force refetch the list immediately to ensure UI is updated
      queryClient.refetchQueries({ queryKey: ['sfds'] });
      
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
