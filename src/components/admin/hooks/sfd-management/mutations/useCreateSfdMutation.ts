
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { sfdApi } from '@/utils/api/modules/sfdApi';

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
      sfdData: SfdFormValues; 
      createAdmin: boolean;
      adminData?: {
        email: string;
        password: string;
        full_name: string;
      }
    }) => {
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
        description: sfdData.description || null
      };

      try {
        console.log("Tentative de création de SFD...");
        
        // Si nous avons des données d'admin et createAdmin=true, incluons-les
        let adminToCreate = null;
        if (createAdmin && adminData && adminData.email && adminData.password && adminData.full_name) {
          adminToCreate = adminData;
        }
        
        const response = await sfdApi.createSfdWithAdmin(newSfd, adminToCreate);
        
        if (!response || !response.sfd || !response.sfd.id) {
          console.error("Réponse invalide reçue:", response);
          throw new Error("Réponse invalide du serveur lors de la création de la SFD");
        }
        
        console.log("SFD créée avec succès:", response.sfd);
        
        // Si nous avons une subvention initiale, créons-la
        if (sfdData.subsidy_balance && sfdData.subsidy_balance > 0) {
          console.log("Création de la subvention initiale...");
          
          const subsidyData = {
            sfd_id: response.sfd.id,
            amount: parseFloat(String(sfdData.subsidy_balance)),
            remaining_amount: parseFloat(String(sfdData.subsidy_balance)),
            allocated_by: user.id,
            status: 'active',
            description: 'Subvention initiale lors de la création de la SFD'
          };

          try {
            await sfdApi.createSfdSubsidy(subsidyData);
            console.log("Subvention créée avec succès");
          } catch (subsidyError) {
            console.warn("Erreur lors de la création de la subvention initiale:", subsidyError);
            // Nous continuons malgré l'erreur de subvention
          }
        }

        return {
          sfd: response.sfd,
          admin: response.admin,
          hasSubsidy: sfdData.subsidy_balance && sfdData.subsidy_balance > 0
        };
      } catch (error: any) {
        console.error("Erreur critique lors de l'ajout de la SFD:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      
      toast({
        title: 'SFD ajoutée',
        description: data.admin 
          ? 'La nouvelle SFD et son administrateur ont été ajoutés avec succès.' 
          : 'La nouvelle SFD a été ajoutée avec succès.',
      });

      if (user && data.sfd) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { 
            sfd_id: data.sfd.id,
            admin_created: !!data.admin,
            subsidy_added: data.hasSubsidy
          },
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
