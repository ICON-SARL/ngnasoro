
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export interface SfdFormValues {
  name: string;
  code: string;
  region?: string;
  status?: 'active' | 'pending' | 'suspended';
  logo_url?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  description?: string | null;
  // Include other optional fields that might be in the form
  email?: string | null;
  address?: string | null;
  legal_document_url?: string | null;
  subsidy_balance?: number;
}

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
        description: sfdData.description || null,
      };

      try {
        // Appel à la fonction Edge pour créer la SFD
        const { data, error } = await supabase.functions.invoke('create-sfd', {
          body: {
            sfd_data: newSfd,
            admin_id: user.id
          }
        });

        if (error) {
          console.error("Erreur lors de la création de la SFD:", error);
          throw new Error(`Erreur lors de la création de la SFD: ${error.message}`);
        }

        if (!data) {
          throw new Error("Aucune réponse reçue du serveur");
        }

        return data;
      } catch (error: any) {
        console.error("Erreur critique lors de l'ajout de la SFD:", error);
        throw new Error(error.message || "Une erreur est survenue lors de la création de la SFD");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD ajoutée',
        description: 'La nouvelle SFD a été ajoutée avec succès.',
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: data.id },
          status: 'success',
        }).catch(err => console.error('Error logging audit event:', err));
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
        }).catch(err => console.error('Error logging audit event:', err));
      }
    },
  });
}
