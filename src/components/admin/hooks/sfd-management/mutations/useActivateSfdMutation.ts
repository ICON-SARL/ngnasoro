
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useActivateSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sfdId: string) => {
      const { data, error } = await supabase
        .from('sfds')
        .update({ status: 'active' })
        .eq('id', sfdId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, sfdId) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD activée',
        description: `Le compte SFD a été activé avec succès.`,
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'activate_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: sfdId },
          status: 'success',
        });
      }
    },
    onError: (error, sfdId) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'activate_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { sfd_id: sfdId, error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
    },
  });
}
