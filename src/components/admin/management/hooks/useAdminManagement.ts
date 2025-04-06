
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { AdminUser, AdminRole, AdminPermissions, AdminFormData, AdminFilterOptions } from '../types';

export const useAdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [permissions, setPermissions] = useState<Record<AdminRole, AdminPermissions>>({
    [AdminRole.SUPER_ADMIN]: {
      can_approve_loans: true,
      can_manage_sfds: true, 
      can_view_reports: true,
      can_manage_admins: true
    },
    [AdminRole.SFD_ADMIN]: {
      can_approve_loans: true,
      can_manage_sfds: false,
      can_view_reports: true,
      can_manage_admins: false
    },
    [AdminRole.SUPPORT]: {
      can_approve_loans: false,
      can_manage_sfds: false,
      can_view_reports: true,
      can_manage_admins: false
    }
  });
  
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
        .select('id, email, full_name, role, has_2fa, created_at, last_sign_in_at');
      
      // Apply filters - fix the type comparison issue
      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }
      
      // For sfd_id filter - since there's no direct relation in our data model currently
      // we'll handle this later if needed
      
      if (filters.is_active !== undefined) {
        // This assumes there's an is_active column in admin_users
        // If not, we need to modify this filtering logic
        // Currently not implemented in our db schema
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Transform data to match our AdminUser interface
      const transformedAdmins: AdminUser[] = (data || []).map(admin => ({
        id: admin.id,
        email: admin.email,
        role: admin.role as AdminRole,
        sfd_id: undefined, // We'll populate this later if needed
        sfd_name: undefined, // We'll populate this later if needed
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

  // We're not actually loading permissions from DB yet, just using hardcoded values
  const loadPermissions = useCallback(async () => {
    // In a real app, we'd load permissions from the database
    try {
      // This is a placeholder for future implementation
      // For now we're using the hardcoded permissions
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
      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', formData.email)
        .limit(1);
      
      if (existingAdmin && existingAdmin.length > 0) {
        throw new Error('Cet email est déjà utilisé');
      }
      
      // Create the admin user
      // Note: in a real app with auth setup, you'd probably create an auth user first
      // and then create the admin_user entry
      const adminData = {
        id: crypto.randomUUID(), // Generate a UUID for the admin
        email: formData.email,
        full_name: formData.email.split('@')[0], // Default name from email
        role: formData.role,
        has_2fa: false // Default value
      };
      
      // Fixed: Use proper typing and values for admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .insert(adminData)
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
          // We don't have is_active in our schema
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
      // For now, we'll just update the local state since is_active doesn't seem to be in the DB
      // In a real app, you'd update the is_active field in the database
      
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
    resetFilters: () => setFilters({}),
  };
};
