import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/auth/AuthContext';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { supabase } from '@/integrations/supabase/client';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  // At least 8 characters, contains uppercase, lowercase and a number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
}

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

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      const isAdmin = userRoles?.some(r => r.role === 'admin');
      
      if (!isAdmin) {
        throw new Error("Vous n'avez pas les permissions nécessaires pour créer une SFD");
      }

      if (createAdmin && adminData) {
        if (!adminData.email || !adminData.password || !adminData.full_name) {
          throw new Error("Données administrateur incomplètes");
        }

        if (!isValidEmail(adminData.email)) {
          throw new Error("Format d'email invalide pour l'administrateur");
        }

        if (!isValidPassword(adminData.password)) {
          throw new Error("Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre");
        }
      }

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
        console.log("Création d'admin?", createAdmin, "avec les données:", 
          createAdmin && adminData ? { ...adminData, password: '******' } : null);
        
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
        
        return {
          sfd: data.sfd,
          admin: data.admin,
          hasSubsidy: sfdData.subsidy_balance && sfdData.subsidy_balance > 0
        };
      } catch (error: any) {
        console.error("Erreur critique lors de l'ajout de la SFD:", error);
        
        let errorMessage = "Une erreur est survenue lors de la création de la SFD";
        
        if (error.message) {
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('NetworkError') ||
              error.message.includes('Failed to send')) {
            errorMessage = "Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.";
          } else if (error.message.includes('déjà utilisé') || 
                     error.message.includes('already registered') ||
                     error.message.includes('already exists')) {
            errorMessage = "Cet email est déjà utilisé. Veuillez utiliser une autre adresse email.";
          } else if (error.message.includes('non-2xx status')) {
            errorMessage = "Erreur de communication avec le serveur. Veuillez contacter l'administrateur.";
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
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
        logAuditEvent(
          AuditLogCategory.SFD_OPERATIONS,
          'create_sfd',
          { 
            sfd_id: data.sfd.id,
            admin_created: !!data.admin,
            subsidy_added: data.hasSubsidy
          },
          user.id,
          AuditLogSeverity.INFO,
          'success'
        );
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `${error.message}`,
        variant: 'destructive',
      });

      if (user) {
        logAuditEvent(
          AuditLogCategory.SFD_OPERATIONS,
          'create_sfd_failed',
          { 
            error: error.message
          },
          user.id,
          AuditLogSeverity.ERROR,
          'failure'
        );
      }
    }
  });
}
