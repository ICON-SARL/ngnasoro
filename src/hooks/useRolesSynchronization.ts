
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useRolesSynchronization() {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const synchronizeRoles = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('synchronize-user-roles');
      
      if (error) throw error;
      
      // Log successful sync
      await logAuditEvent({
        action: 'roles_synchronized',
        category: AuditLogCategory.ADMIN_ACTION,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        details: { timestamp: new Date().toISOString() }
      });

      toast({
        title: "Synchronisation réussie",
        description: "Les rôles utilisateurs ont été synchronisés avec succès"
      });
      
      return true;
    } catch (err) {
      console.error('Error synchronizing roles:', err);
      
      // Log sync failure
      await logAuditEvent({
        action: 'roles_sync_failed',
        category: AuditLogCategory.ADMIN_ACTION,
        severity: AuditLogSeverity.ERROR,
        status: 'failure',
        details: { error: err.message }
      });

      toast({
        title: "Erreur de synchronisation",
        description: "La synchronisation des rôles a échoué",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncing,
    synchronizeRoles
  };
}
