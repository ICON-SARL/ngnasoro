
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Role, Permission, NewRoleData } from './types';
import { useToast } from '@/hooks/use-toast';
import { PERMISSIONS } from '@/utils/auth/roleTypes';
import { useAuth } from '@/hooks/useAuth';

// SFD-specific permissions
const SFD_PERMISSIONS = {
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_CLIENTS: 'view_clients',
  APPROVE_LOANS: 'approve_loans',
  VIEW_LOANS: 'view_loans',
  MANAGE_TRANSACTIONS: 'manage_transactions',
  VIEW_TRANSACTIONS: 'view_transactions',
  VIEW_REPORTS: 'view_reports',
  MANAGE_STAFF: 'manage_staff',
};

// Define a type representing admin_roles table data
interface AdminRoleData {
  id: string;
  name: string | null;
  description: string | null;
  permissions: string[] | null;
  sfd_id?: string | null;
  created_at?: string;
}

export function useRoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const { activeSfdId } = useAuth();

  const [newRole, setNewRole] = useState<NewRoleData>({
    name: '',
    description: '',
    permissions: []
  });

  // Generate permissions list from SFD_PERMISSIONS
  useEffect(() => {
    const permList: Permission[] = Object.entries(SFD_PERMISSIONS).map(([key, value]) => ({
      id: value,
      name: key,
      description: `Permission to ${key.toLowerCase().replace(/_/g, ' ')}`,
      category: key.split('_')[0]
    }));
    
    setPermissions(permList);
  }, []);

  // Load roles specific to the active SFD
  useEffect(() => {
    const fetchRoles = async () => {
      if (!activeSfdId) return;
      
      setIsLoading(true);
      try {
        // Use admin_roles table with a filter for SFD-specific roles
        const { data, error } = await supabase
          .from('admin_roles')
          .select('*')
          .eq('sfd_id', activeSfdId);
        
        if (error) {
          throw error;
        }

        if (data) {
          // Transform the data with proper type assertion
          const roleData = data as AdminRoleData[];
          const rolesList: Role[] = roleData.map(role => ({
            id: role.id,
            name: role.name || '',
            description: role.description || '',
            permissions: Array.isArray(role.permissions) ? role.permissions : []
          }));
          
          setRoles(rolesList);
        }
      } catch (error) {
        console.error('Error fetching SFD roles:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les rôles SFD',
          variant: 'destructive'
        });
        
        // Fallback to mock data if fetching fails
        setRoles([
          {
            id: "mock-1",
            name: "SFD Admin",
            description: "Administrateur SFD avec tous les droits",
            permissions: ["manage_clients", "view_clients", "approve_loans"]
          },
          {
            id: "mock-2",
            name: "Agent",
            description: "Agent SFD avec droits limités",
            permissions: ["view_clients"]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [activeSfdId, toast]);

  const handleTogglePermission = (permissionId: string) => {
    setNewRole(prevRole => {
      const permissions = prevRole.permissions.includes(permissionId)
        ? prevRole.permissions.filter(p => p !== permissionId)
        : [...prevRole.permissions, permissionId];
      return { ...prevRole, permissions };
    });
  };

  // Completely simplified version to avoid deep type instantiation
  const handleSaveNewRole = async () => {
    if (!activeSfdId) {
      toast({
        title: 'Erreur',
        description: 'Aucune SFD sélectionnée',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Extract all values as primitives
      const roleName = newRole.name;
      const roleDesc = newRole.description;
      // Create a new array by spreading
      const rolePerms = [...newRole.permissions]; 

      if (isEditMode) {
        // Create a simple update operation with manually specified fields
        await supabase
          .from('admin_roles')
          .update({
            name: roleName,
            description: roleDesc,
            permissions: rolePerms
          } as any) // Use type assertion to bypass deep type checking
          .eq('name', roleName)
          .eq('sfd_id', activeSfdId);

        toast({
          title: 'Rôle mis à jour',
          description: `Le rôle ${roleName} a été mis à jour avec succès`
        });
      } else {
        // Create a simple insert operation with manually specified fields
        await supabase
          .from('admin_roles')
          .insert({
            sfd_id: activeSfdId,
            name: roleName,
            description: roleDesc,
            permissions: rolePerms
          } as any); // Use type assertion to bypass deep type checking

        toast({
          title: 'Rôle créé',
          description: `Le rôle ${roleName} a été créé avec succès`
        });
      }

      // Reset form and fetch updated roles
      setShowNewRoleDialog(false);
      setIsEditMode(false);
      setNewRole({
        name: '',
        description: '',
        permissions: []
      });

      // Refresh roles with simplified approach
      const { data } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('sfd_id', activeSfdId);

      if (data) {
        const fetchedRoles = data as any[];
        setRoles(fetchedRoles.map(role => ({
          id: role.id,
          name: role.name || '',
          description: role.description || '',
          permissions: Array.isArray(role.permissions) ? role.permissions : []
        })));
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le rôle',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: 'Rôle supprimé',
        description: 'Le rôle a été supprimé avec succès'
      });

      // Update local state
      setRoles(roles.filter(role => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le rôle',
        variant: 'destructive'
      });
    }
  };

  const handleEditRole = (role: Role) => {
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setIsEditMode(true);
    setShowNewRoleDialog(true);
  };

  return {
    roles,
    permissions,
    isLoading,
    showNewRoleDialog,
    setShowNewRoleDialog,
    newRole,
    setNewRole,
    handleTogglePermission,
    handleSaveNewRole,
    handleDeleteRole,
    handleEditRole,
    isEditMode,
    setIsEditMode
  };
}
