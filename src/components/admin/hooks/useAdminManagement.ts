
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AuditLogCategory, AuditLogSeverity, logAuditEvent } from '@/utils/auditLogger';
import { useAuth } from '@/hooks/useAuth';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has2FA: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

// Custom hook for admin management
export function useAdminManagement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch admin users
  const { data: adminUsers, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: adminRolesData, error: rolesError } = await supabase
        .from('admin_roles')
        .select('*');

      if (rolesError) throw rolesError;
      
      const roles = adminRolesData || [];
      
      // Fetch users with admin roles
      const { data: usersData, error: usersError } = await supabase
        .from('admin_users')
        .select(`
          id, 
          full_name, 
          email, 
          role, 
          has_2fa, 
          created_at, 
          last_sign_in_at
        `);

      if (usersError) throw usersError;
      
      return (usersData || []).map((admin) => ({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        has2FA: admin.has_2fa,
        created_at: admin.created_at,
        last_sign_in_at: admin.last_sign_in_at
      })) as AdminUser[];
    }
  });

  // Fetch roles
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*');

      if (error) throw error;
      
      return (data || []).map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions
      })) as AdminRole[];
    }
  });

  // Filter admins based on search term and role filter
  const filteredAdmins = adminUsers?.filter((admin) => {
    const matchesSearch = 
      admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Add a new admin
  const addAdmin = useMutation({
    mutationFn: async (adminData: {
      email: string;
      password: string;
      full_name: string;
      role: string;
      notify: boolean;
    }) => {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true,
        user_metadata: {
          full_name: adminData.full_name,
          role: adminData.role
        }
      });

      if (authError) throw authError;

      // 2. Add user to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: adminData.email,
          full_name: adminData.full_name,
          role: adminData.role,
          has_2fa: false
        });

      if (adminError) throw adminError;

      // 3. Log this action
      await logAuditEvent({
        user_id: user?.id,
        action: 'create_admin',
        category: AuditLogCategory.USER_MANAGEMENT,
        severity: AuditLogSeverity.INFO,
        details: { admin_email: adminData.email, role: adminData.role },
        status: 'success'
      });

      // 4. If notification is enabled, send email notification
      if (adminData.notify) {
        await supabase.functions.invoke('admin-notification', {
          body: {
            adminEmail: adminData.email,
            adminName: adminData.full_name,
            role: adminData.role,
            createdBy: user?.full_name || 'A super admin'
          }
        });
      }

      return authData.user;
    },
    onSuccess: () => {
      toast({
        title: 'Administrateur créé',
        description: 'Le compte administrateur a été créé avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Échec de la création: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update admin (role, 2FA status)
  const updateAdmin = useMutation({
    mutationFn: async (data: { adminId: string; role?: string; has2FA?: boolean }) => {
      const updateData: any = {};
      if (data.role !== undefined) updateData.role = data.role;
      if (data.has2FA !== undefined) updateData.has_2fa = data.has2FA;
      
      const { error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', data.adminId);

      if (error) throw error;

      // Log this action
      await logAuditEvent({
        user_id: user?.id,
        action: 'update_admin',
        category: AuditLogCategory.USER_MANAGEMENT,
        severity: AuditLogSeverity.INFO,
        details: { admin_id: data.adminId, updated_fields: Object.keys(updateData) },
        status: 'success'
      });

      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Administrateur mis à jour',
        description: 'Les informations ont été mises à jour avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Échec de la mise à jour: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete admin
  const deleteAdmin = useMutation({
    mutationFn: async (adminId: string) => {
      // Find admin details first for the audit log
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('email')
        .eq('id', adminId)
        .single();

      // Delete the admin from auth.users (will cascade to admin_users)
      const { error } = await supabase.auth.admin.deleteUser(adminId);

      if (error) throw error;

      // Log this action
      await logAuditEvent({
        user_id: user?.id,
        action: 'delete_admin',
        category: AuditLogCategory.USER_MANAGEMENT,
        severity: AuditLogSeverity.WARNING,
        details: { admin_id: adminId, admin_email: adminData?.email },
        status: 'success'
      });

      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Administrateur supprimé',
        description: 'Le compte administrateur a été supprimé avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Échec de la suppression: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Add a new role
  const addRole = useMutation({
    mutationFn: async (roleData: { name: string; description: string; permissions: string[] }) => {
      const { data, error } = await supabase
        .from('admin_roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions
        })
        .select();

      if (error) throw error;

      // Log this action
      await logAuditEvent({
        user_id: user?.id,
        action: 'create_role',
        category: AuditLogCategory.USER_MANAGEMENT,
        severity: AuditLogSeverity.INFO,
        details: { role_name: roleData.name, permissions: roleData.permissions },
        status: 'success'
      });

      return data[0];
    },
    onSuccess: () => {
      toast({
        title: 'Rôle créé',
        description: 'Le nouveau rôle a été créé avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Échec de la création du rôle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update role
  const updateRole = useMutation({
    mutationFn: async (data: { 
      roleId: string; 
      name?: string; 
      description?: string; 
      permissions?: string[] 
    }) => {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.permissions) updateData.permissions = data.permissions;
      
      const { error } = await supabase
        .from('admin_roles')
        .update(updateData)
        .eq('id', data.roleId);

      if (error) throw error;

      // Log this action
      await logAuditEvent({
        user_id: user?.id,
        action: 'update_role',
        category: AuditLogCategory.USER_MANAGEMENT,
        severity: AuditLogSeverity.INFO,
        details: { role_id: data.roleId, updated_fields: Object.keys(updateData) },
        status: 'success'
      });

      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Rôle mis à jour',
        description: 'Le rôle a été mis à jour avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Échec de la mise à jour du rôle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete role
  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      // Check if any admin is using this role
      const { data: usersWithRole, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('role', roleId);

      if (checkError) throw checkError;

      if (usersWithRole && usersWithRole.length > 0) {
        throw new Error('Ce rôle est assigné à des administrateurs. Veuillez d\'abord changer leur rôle.');
      }

      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      // Log this action
      await logAuditEvent({
        user_id: user?.id,
        action: 'delete_role',
        category: AuditLogCategory.USER_MANAGEMENT,
        severity: AuditLogSeverity.WARNING,
        details: { role_id: roleId },
        status: 'success'
      });

      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Rôle supprimé',
        description: 'Le rôle a été supprimé avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Échec de la suppression du rôle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  return {
    adminUsers,
    filteredAdmins,
    roles,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    isLoadingAdmins,
    isLoadingRoles,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    addRole,
    updateRole,
    deleteRole
  };
}
