
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { UserRole } from '@/hooks/auth/types';
import { logAuditEvent } from '@/utils/audit/auditLoggerCore';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

export function useRoleAssignment() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [availableRoles, setAvailableRoles] = useState<{value: string, label: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Set available roles based on the current user's permissions
    setIsLoading(true);
    
    if (isAdmin) {
      // Super admin can assign any role
      setAvailableRoles([
        { value: UserRole.ADMIN, label: 'Administrateur' },
        { value: UserRole.SFD_ADMIN, label: 'Administrateur SFD' },
        { value: UserRole.USER, label: 'Utilisateur' },
        { value: UserRole.CLIENT, label: 'Client' }
      ]);
    } else {
      // SFD admin can only assign SFD-specific roles
      setAvailableRoles([
        { value: UserRole.USER, label: 'Agent SFD' },
        { value: UserRole.CLIENT, label: 'Client' }
      ]);
    }
    
    setIsLoading(false);
  }, [isAdmin]);
  
  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      if (!user) throw new Error("Utilisateur non authentifié");
      
      // Convert role if needed for database storage
      let dbRole = role;
      
      // Check if the user has permission to assign this role
      if (!isAdmin && dbRole === UserRole.ADMIN) {
        throw new Error("Vous n'avez pas la permission d'attribuer le rôle d'administrateur");
      }
      
      // Call the database function to assign the role
      const { data, error } = await supabase.rpc('assign_role', {
        user_id: userId,
        role: dbRole
      });
      
      if (error) throw error;
      
      // Log the role assignment in audit logs
      await logAuditEvent({
        user_id: user.id,
        action: 'assign_role',
        category: AuditLogCategory.USER_MANAGEMENT,
        severity: AuditLogSeverity.INFO,
        target_resource: `users/${userId}`,
        details: {
          assigned_role: role,
          assigned_to: userId,
          timestamp: new Date().toISOString()
        },
        status: 'success'
      });
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Rôle attribué",
        description: "Le rôle de l'utilisateur a été mis à jour avec succès",
      });
      
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible d'attribuer le rôle: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  return {
    assignRole,
    availableRoles,
    isLoading
  };
}
