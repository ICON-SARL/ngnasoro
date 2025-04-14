
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useEditSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SfdFormValues }) => {
      console.log('Editing SFD with ID:', id, 'and data:', data);
      
      // Extract only fields that should be updated
      const updateData = {
        name: data.name,
        code: data.code,
        region: data.region,
        status: data.status,
        description: data.description,
        contact_email: data.contact_email,
        phone: data.phone,
        logo_url: data.logo_url,
        legal_document_url: data.legal_document_url
      };
      
      const { error } = await supabase
        .from('sfds')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase error while updating SFD:', error);
        throw error;
      }
      
      // Return the updated data directly instead of fetching it again
      return { id, ...updateData };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD modifiée',
        description: 'Les informations de la SFD ont été mises à jour avec succès.',
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'update_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: variables.id },
          status: 'success',
        });
      }
    },
    onError: (error: any, variables) => {
      console.error('Error in editSfdMutation:', error);
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'update_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { sfd_id: variables.id, error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
    },
  });
}
