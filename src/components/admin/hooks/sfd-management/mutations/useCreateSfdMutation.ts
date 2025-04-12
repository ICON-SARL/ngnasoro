
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { supabase } from '@/integrations/supabase/client';

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

      // Préparer les données pour la fonction edge
      const sfdDataToSend = {
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
        console.log("Tentative de création de SFD...", sfdDataToSend);
        
        // Créer la SFD avec ou sans administrateur
        const { data, error } = await supabase.functions.invoke('create-sfd-with-admin', {
          body: JSON.stringify({
            sfdData: sfdDataToSend,
            adminData: createAdmin && adminData ? adminData : null
          })
        });

        if (error) {
          console.error("Erreur lors de l'appel à la fonction edge:", error);
          throw new Error(`Erreur de communication avec le serveur: ${error.message}`);
        }
        
        if (data?.error) {
          console.error("Erreur renvoyée par la fonction edge:", data.error);
          throw new Error(data.error);
        }
        
        if (!data?.sfd) {
          console.error("Réponse invalide:", data);
          throw new Error("Réponse invalide du serveur");
        }
        
        console.log("SFD créée avec succès:", data.sfd);
        
        // Si nous avons une subvention initiale, créons-la
        if (sfdData.subsidy_balance && sfdData.subsidy_balance > 0 && data.sfd.id) {
          console.log("Création de la subvention initiale...");
          
          try {
            const { data: subsidyData, error: subsidyError } = await supabase.functions.invoke('create_sfd_subsidy', {
              body: JSON.stringify({
                subsidy_data: {
                  sfd_id: data.sfd.id,
                  amount: parseFloat(String(sfdData.subsidy_balance)),
                  remaining_amount: parseFloat(String(sfdData.subsidy_balance)),
                  allocated_by: user.id,
                  status: 'active',
                  description: 'Subvention initiale lors de la création de la SFD'
                }
              })
            });

            if (subsidyError) {
              console.warn("Erreur lors de la création de la subvention:", subsidyError);
            } else {
              console.log("Subvention créée avec succès:", subsidyData);
            }
          } catch (subsidyError) {
            console.warn("Exception lors de la création de la subvention:", subsidyError);
            // Nous continuons malgré l'erreur de subvention
          }
        }

        return {
          sfd: data.sfd,
          admin: data.admin,
          hasSubsidy: sfdData.subsidy_balance && sfdData.subsidy_balance > 0
        };
      } catch (error: any) {
        console.error("Erreur critique lors de l'ajout de la SFD:", error);
        
        // Fournir un message d'erreur plus détaillé à l'utilisateur
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
      // Invalider plusieurs requêtes connexes pour garantir que toutes les données sont actualisées
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-stats'] });
      
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
