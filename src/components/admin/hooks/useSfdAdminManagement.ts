
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { logAuditEvent } from '@/utils/audit/auditLoggerCore';

export function useSfdAdminManagement() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to fetch SFD admins
  const {
    data: sfdAdmins,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['sfd-admins'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('role', 'sfd_admin');
          
        if (error) throw error;
        
        return data || [];
      } catch (err: any) {
        console.error('Error fetching SFD admins:', err);
        setError(err.message);
        return [];
      }
    },
  });

  // Mutation to add an SFD admin
  const { mutate: addSfdAdmin, isPending: isAdding } = useMutation({
    mutationFn: async (adminData: {
      email: string;
      password: string;
      full_name: string;
      role: string;
      sfd_id: string;
      notify: boolean;
    }) => {
      try {
        setError(null);
        
        // 1. Create the auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: adminData.email,
          password: adminData.password,
          email_confirm: true,
          user_metadata: {
            full_name: adminData.full_name,
            sfd_id: adminData.sfd_id
          },
          app_metadata: {
            role: adminData.role,
          }
        });
        
        if (authError) throw authError;
        
        if (!authData.user) {
          throw new Error('Failed to create user account');
        }
        
        console.log('Auth user created:', authData.user.id);
        
        // 2. Assign role in the database
        const { error: roleError } = await supabase.rpc('assign_role', {
          user_id: authData.user.id,
          role: adminData.role
        });
        
        if (roleError) {
          console.error('Error assigning role:', roleError);
          // Continue despite role assignment error - we'll handle it separately
        }
        
        // 3. Add user to admin_users table
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert([
            {
              id: authData.user.id,
              email: adminData.email,
              full_name: adminData.full_name,
              role: adminData.role,
              sfd_id: adminData.sfd_id
            }
          ]);
          
        if (adminError) throw adminError;
        
        // 4. Log audit event
        await logAuditEvent(
          AuditLogCategory.ADMIN_ACTION,
          'sfd_admin_created',
          {
            email: adminData.email,
            sfd_id: adminData.sfd_id
          },
          authData.user.id,
          AuditLogSeverity.INFO
        );
        
        // 5. Send notification if requested
        if (adminData.notify) {
          // Send welcome email (implementation depends on your notification system)
          console.log('Sending welcome notification to new SFD admin');
        }
        
        return authData.user;
      } catch (err: any) {
        console.error('Error adding SFD admin:', err);
        setError(err.message);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été créé avec succès.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'administrateur SFD: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation to delete an SFD admin
  const { mutate: deleteSfdAdmin } = useMutation({
    mutationFn: async (adminId: string) => {
      try {
        setError(null);
        
        // 1. Delete the auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(
          adminId
        );
        
        if (authError) throw authError;
        
        // 2. Delete from admin_users table
        const { error: adminError } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', adminId);
          
        if (adminError) throw adminError;
        
        // 3. Log audit event
        await logAuditEvent(
          AuditLogCategory.ADMIN_ACTION,
          'sfd_admin_deleted',
          {
            admin_id: adminId
          },
          undefined,
          AuditLogSeverity.WARNING
        );
        
        return true;
      } catch (err: any) {
        console.error('Error deleting SFD admin:', err);
        setError(err.message);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été supprimé avec succès.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'administrateur SFD: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    sfdAdmins,
    isLoading: isLoading || isAdding,
    error,
    addSfdAdmin,
    deleteSfdAdmin,
    refetch
  };
}
