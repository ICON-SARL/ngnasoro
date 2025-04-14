
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
      const { data: updatedSfd, error } = await supabase
        .from('sfds')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
