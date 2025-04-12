
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { sfdAccountsApi, SfdCreateData, AdminCreateData, AccountTypeData } from '@/utils/api/modules/sfdAccountsApi';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useSfdAccountsCreation() {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const createSfdWithAccounts = useMutation({
    mutationFn: async ({
      sfdData,
      adminData,
      accounts
    }: {
      sfdData: SfdCreateData;
      adminData: AdminCreateData;
      accounts?: AccountTypeData;
    }) => {
      try {
        setError(null);
        
        return await sfdAccountsApi.createSfdWithAdminAndAccounts(
          sfdData,
          adminData,
          accounts
        );
      } catch (err: any) {
        setError(err.message || "Une erreur s'est produite lors de la création");
        throw err;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Création réussie",
        description: "La SFD, l'administrateur et les comptes ont été créés avec succès.",
      });

      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd_with_accounts',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          status: 'success',
          details: {
            sfd_id: data?.data?.sfd?.id,
            admin_created: true,
            accounts_created: true
          }
        }).catch(err => console.error('Error logging audit event:', err));
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de création",
        description: error.message || "Une erreur s'est produite lors de la création de la SFD",
        variant: "destructive",
      });

      // Log audit event for error
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd_with_accounts',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          status: 'failure',
          error_message: error.message,
          details: {
            error: error.message
          }
        }).catch(err => console.error('Error logging audit event:', err));
      }
    }
  });

  return {
    createSfdWithAccounts,
    isCreating: createSfdWithAccounts.isPending,
    error
  };
}
