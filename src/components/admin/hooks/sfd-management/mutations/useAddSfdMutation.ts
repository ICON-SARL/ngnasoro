
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useAddSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sfdData: SfdFormValues) => {
      // Préparer les données pour l'insertion
      const newSfd = {
        name: sfdData.name,
        code: sfdData.code,
        region: sfdData.region || null,
        status: sfdData.status || 'active',
        logo_url: sfdData.logo_url || null,
        // We don't store subsidy_balance directly in the sfds table
      };

      // Utiliser l'API RPC pour contourner les politiques RLS
      // ou utiliser directement l'API avec une meilleure gestion des erreurs
      try {
        const { data, error } = await supabase
          .from('sfds')
          .insert([newSfd])
          .select();

        if (error) {
          console.error("Erreur lors de l'ajout de la SFD:", error);
          throw new Error(`Erreur lors de l'ajout de la SFD: ${error.message}`);
        }

        // Si nous avons une subvention initiale, créons-la
        if (sfdData.subsidy_balance && sfdData.subsidy_balance > 0 && data && data[0]) {
          const newSubsidy = {
            sfd_id: data[0].id,
            amount: sfdData.subsidy_balance,
            remaining_amount: sfdData.subsidy_balance,
            allocated_by: user?.id || null,
            status: 'active',
            description: 'Subvention initiale lors de la création de la SFD'
          };

          const { error: subsidyError } = await supabase
            .from('sfd_subsidies')
            .insert([newSubsidy]);

          if (subsidyError) {
            console.warn("Erreur lors de la création de la subvention initiale:", subsidyError);
            // Nous continuons malgré l'erreur de subvention
          }
        }

        return data;
      } catch (error: any) {
        console.error("Erreur critique lors de l'ajout de la SFD:", error);
        throw error;
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
          details: { sfd_id: data?.[0]?.id },
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
