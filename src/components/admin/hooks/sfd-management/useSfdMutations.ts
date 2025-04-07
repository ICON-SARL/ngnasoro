
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useSfdMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Add SFD mutation
  const addSfdMutation = useMutation({
    mutationFn: async (sfdData: SfdFormValues) => {
      // Ensure required fields are provided
      const newSfd = {
        name: sfdData.name,
        code: sfdData.code,
        region: sfdData.region || null,
        status: sfdData.status || 'active',
        logo_url: sfdData.logo_url || null,
        subsidy_balance: sfdData.subsidy_balance || 0
      };

      const { data, error } = await supabase
        .from('sfds')
        .insert([newSfd])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD ajoutée',
        description: 'La nouvelle SFD a été ajoutée avec succès.',
      });

      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { },
          status: 'success',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      // Log audit event for failure
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

  // Edit SFD mutation
  const editSfdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SfdFormValues }) => {
      const { data: updatedData, error } = await supabase
        .from('sfds')
        .update(data)
        .eq('id', id)
        .select();

      if (error) throw error;
      return updatedData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD modifiée',
        description: 'Les informations de la SFD ont été mises à jour avec succès.',
      });

      // Log audit event
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
    onError: (error, variables) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      // Log audit event for failure
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

  // Mutation to suspend a SFD
  const suspendSfdMutation = useMutation({
    mutationFn: async (sfdId: string) => {
      const { data, error } = await supabase
        .from('sfds')
        .update({ status: 'suspended' })
        .eq('id', sfdId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, sfdId) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD suspendue',
        description: `Le compte SFD a été suspendu avec succès.`,
      });

      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'suspend_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.WARNING,
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

      // Log audit event for failure
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'suspend_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { sfd_id: sfdId, error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
    },
  });

  // Mutation to reactivate a SFD
  const reactivateSfdMutation = useMutation({
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
        title: 'SFD réactivée',
        description: `Le compte SFD a été réactivé avec succès.`,
      });

      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'reactivate_sfd',
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

      // Log audit event for failure
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'reactivate_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { sfd_id: sfdId, error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
    },
  });

  return {
    addSfdMutation,
    editSfdMutation,
    suspendSfdMutation,
    reactivateSfdMutation
  };
}
