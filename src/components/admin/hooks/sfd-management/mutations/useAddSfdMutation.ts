
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
        const sfdResponse = await edgeFunctionApi.callEdgeFunction('create_sfd', {
          sfd_data: newSfd,
          admin_id: user.id
        });

        if (!sfdResponse) {
          throw new Error("Erreur lors de l'ajout de la SFD");
        }
        
        const newSfdData = sfdResponse;
        
        // 3. Si nous avons une subvention initiale, créons-la
        if (sfdData.subsidy_balance && sfdData.subsidy_balance > 0) {
          const subsidyData = {
            sfd_id: newSfdData.id,
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
          }
        }

        return [newSfdData];
      } catch (error: any) {
        console.error("Erreur critique lors de l'ajout de la SFD:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD ajoutée',
        description: 'La nouvelle SFD a été ajoutée avec succès.',
      });

      if (user && data[0]) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: data[0].id },
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
