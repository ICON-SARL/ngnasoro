
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Role, Permission, NewRoleData } from './types';
import { useToast } from '@/hooks/use-toast';
import { PERMISSIONS } from '@/utils/auth/roleTypes';

export function useRoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const [newRole, setNewRole] = useState<NewRoleData>({
    name: '',
    description: '',
    permissions: []
  });

  // Generate permissions list from the PERMISSIONS object
  useEffect(() => {
    const permList: Permission[] = Object.entries(PERMISSIONS).map(([key, value]) => ({
      id: value,
      name: key,
      description: `Permission to ${key.toLowerCase().replace(/_/g, ' ')}`,
      category: key.split('_')[0]
    }));
    
    setPermissions(permList);
  }, []);

  // Load roles from the database
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const { data: adminRoles, error } = await supabase
          .from('admin_roles')
          .select('*');
        
        if (error) {
          throw error;
        }

        if (adminRoles) {
          setRoles(adminRoles.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || []
          })));
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les rôles',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [toast]);

  const handleTogglePermission = (permissionId: string) => {
    setNewRole(prevRole => {
      const permissions = prevRole.permissions.includes(permissionId)
        ? prevRole.permissions.filter(p => p !== permissionId)
        : [...prevRole.permissions, permissionId];
      return { ...prevRole, permissions };
    });
  };

  const handleSaveNewRole = async () => {
    try {
      if (isEditMode) {
        // Update existing role
        const { error } = await supabase
          .from('admin_roles')
          .update({
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions
          })
          .eq('name', newRole.name);

        if (error) throw error;

        toast({
          title: 'Rôle mis à jour',
          description: `Le rôle ${newRole.name} a été mis à jour avec succès`
        });
      } else {
        // Create new role
        const { error } = await supabase
          .from('admin_roles')
          .insert({
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions
          });

        if (error) throw error;

        toast({
          title: 'Rôle créé',
          description: `Le rôle ${newRole.name} a été créé avec succès`
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

      // Refresh roles
      const { data: updatedRoles } = await supabase
        .from('admin_roles')
        .select('*');

      if (updatedRoles) {
        setRoles(updatedRoles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description || '',
          permissions: role.permissions || []
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
