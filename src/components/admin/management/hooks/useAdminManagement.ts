
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { AdminUser, AdminRole, AdminPermissions, AdminFormData, AdminFilterOptions } from '../types';

export const useAdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [permissions, setPermissions] = useState<Record<AdminRole, AdminPermissions>>({} as Record<AdminRole, AdminPermissions>);
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<AdminFilterOptions>({});
  
  // Determine current user role
  const currentUserRole = user?.app_metadata?.role === 'admin' 
    ? AdminRole.SUPER_ADMIN 
    : user?.app_metadata?.role === 'sfd_admin'
    ? AdminRole.SFD_ADMIN
    : AdminRole.SUPPORT;
  
  const loadAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // Start with admin_users query
      let query = supabase
        .from('admin_users')
        .select(`
          id, 
          email, 
          role, 
          last_sign_in_at,
          has_2fa,
          created_at,
          sfds!admin_users_sfd_id_fkey (
            id,
            name
          )
        `);
      
      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters.sfd_id) {
        query = query.eq('sfd_id', filters.sfd_id);
      }
      
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match our AdminUser interface
      const transformedAdmins: AdminUser[] = data.map(admin => ({
        id: admin.id,
        email: admin.email,
        role: admin.role as AdminRole,
        sfd_id: admin.sfds?.id,
        sfd_name: admin.sfds?.name,
        is_active: true, // This would come from your DB, added as a placeholder
        last_login: admin.last_sign_in_at
      }));
      
      setAdmins(transformedAdmins);
    } catch (err: any) {
      console.error('Error loading admins:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les administrateurs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  const loadPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*');
      
      if (error) throw error;
      
      // Transform data to our permissions structure
      const permissionsMap = data.reduce((acc, perm) => {
        acc[perm.role as AdminRole] = {
          can_approve_loans: perm.can_approve_loans,
          can_manage_sfds: perm.can_manage_sfds,
          can_view_reports: perm.can_view_reports,
          can_manage_admins: perm.can_manage_admins
        };
        return acc;
      }, {} as Record<AdminRole, AdminPermissions>);
      
      setPermissions(permissionsMap);
    } catch (err: any) {
      console.error('Error loading permissions:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les permissions.",
        variant: "destructive"
      });
    }
  }, []);
  
  const createAdmin = async (formData: AdminFormData) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // In a real app, this would call your backend API
      // For demo purposes, we'll simulate API call and response
      
      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', formData.email)
        .limit(1);
      
      if (existingAdmin && existingAdmin.length > 0) {
        throw new Error('Cet email est déjà utilisé');
      }
      
      // Create the admin user (this is a simulation)
      const { data, error } = await supabase
        .from('admin_users')
        .insert([
          { 
            email: formData.email,
            role: formData.role,
            sfd_id: formData.sfd_id,
            // In a real app, the password would be hashed by the backend
            // We don't store passwords in Supabase tables directly
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: `L'administrateur ${formData.email} a été créé.`
      });
      
      // Reload admins list
      await loadAdmins();
      
    } catch (err: any) {
      console.error('Error creating admin:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer l'administrateur.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateAdmin = async (admin: AdminUser, permissionChanges: Partial<AdminPermissions>) => {
    setIsLoading(true);
    
    try {
      // Update admin info
      const { error } = await supabase
        .from('admin_users')
        .update({
          role: admin.role,
          sfd_id: admin.sfd_id,
          is_active: admin.is_active
        })
        .eq('id', admin.id);
      
      if (error) throw error;
      
      // Update permissions if there are changes
      if (Object.keys(permissionChanges).length > 0) {
        // In a real app, you'd call your API to update permissions
        console.log('Updating permissions:', admin.role, permissionChanges);
      }
      
      toast({
        title: "Succès",
        description: `Les informations de ${admin.email} ont été mises à jour.`
      });
      
      // Reload admins list
      await loadAdmins();
      
    } catch (err: any) {
      console.error('Error updating admin:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'administrateur.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAdminStatus = async (admin: AdminUser, isActive: boolean) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call your backend API
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: isActive })
        .eq('id', admin.id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: `Le compte de ${admin.email} a été ${isActive ? 'activé' : 'désactivé'}.`
      });
      
      // Update admin in local state
      setAdmins(prevAdmins => 
        prevAdmins.map(a => 
          a.id === admin.id 
            ? { ...a, is_active: isActive } 
            : a
        )
      );
      
    } catch (err: any) {
      console.error('Error toggling admin status:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'administrateur.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (admin: AdminUser) => {
    try {
      // In a real app, this would send a password reset link
      toast({
        title: "Lien de réinitialisation envoyé",
        description: `Un lien de réinitialisation a été envoyé à ${admin.email}.`
      });
    } catch (err: any) {
      console.error('Error resetting password:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le lien de réinitialisation.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);
  
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);
  
  return {
    admins,
    permissions,
    isLoading,
    error,
    filters,
    setFilters,
    createAdmin,
    updateAdmin,
    toggleAdminStatus,
    resetPassword,
    currentUserRole,
    // Helper functions for filtering
    resetFilters: () => setFilters({}),
  };
};
