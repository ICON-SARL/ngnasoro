
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
      
      // Update without trying to return the updated record in the same call
      const { error } = await supabase
        .from('sfds')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase error while updating SFD:', error);
        throw error;
      }
      
      // After successful update, fetch the updated record
      const { data: updatedSfd, error: fetchError } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated SFD:', fetchError);
        // We'll return the update data anyway since the update was successful
        return { id, ...updateData };
      }
      
      console.log('SFD updated successfully:', updatedSfd);
      return updatedSfd;
    },
    onSuccess: (updatedSfd, variables) => {
      console.log('Edit mutation succeeded, updated SFD:', updatedSfd);
      
      // Invalidate and refetch the data to ensure UI is updated
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
          details: { sfd_id: variables.id, updated_data: variables.data },
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
