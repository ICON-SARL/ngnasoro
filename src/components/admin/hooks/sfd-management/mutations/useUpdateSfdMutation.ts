
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '@/components/admin/sfd/schemas/sfdFormSchema';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { useAuth } from '@/hooks/useAuth';

export function useUpdateSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SfdFormValues> }) => {
      // Extract only fields that exist in the sfds table
      const validFields = {
        name: data.name,
        code: data.code,
        region: data.region,
        description: data.description,
        contact_email: data.contact_email,
        phone: data.phone,
        status: data.status,
      };
      
      console.log('Updating SFD with data:', validFields);
      
      // Update without trying to return the updated record in the same call
      const { error } = await supabase
        .from('sfds')
        .update(validFields)
        .eq('id', id);

      if (error) {
        console.error('Error updating SFD:', error);
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
        // Return the update data anyway since the update was successful
        return { id, ...validFields };
      }
      
      console.log('SFD updated successfully:', updatedSfd);
      return updatedSfd;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD modifiée',
        description: 'Les modifications ont été enregistrées avec succès',
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'update_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: variables.id },
          status: 'success'
        });
      }
    },
    onError: (error: any) => {
      console.error('Error in updateSfdMutation:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la modification',
        variant: 'destructive',
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'update_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { error: error.message },
          status: 'failure',
          error_message: error.message
        });
      }
    },
  });
}
