
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminRole, AdminRolePermission, NewRoleData } from './types';
import { toast } from '@/hooks/use-toast';

export function useRoleManager() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminRolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<NewRoleData>({ 
    name: '', 
    description: '', 
    permissions: [] 
  });
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Load roles from the database
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('admin_roles')
          .select('*');
        
        if (error) throw error;
        
        setRoles(data || []);
      } catch (err) {
        console.error('Error fetching roles:', err);
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
  }, []);
  
  // Define available permissions
  useEffect(() => {
    setPermissions([
      {
        id: 'manage_sfds',
        name: 'Gestion des SFDs',
        description: 'Permet de créer, modifier et suspendre des SFDs',
        enabled: false,
      },
      {
        id: 'manage_admins',
        name: 'Gestion des Administrateurs',
        description: 'Permet de créer et gérer des comptes administrateurs',
        enabled: false,
      },
      {
        id: 'approve_credit',
        name: 'Approbation de Crédit',
        description: 'Peut approuver ou rejeter des demandes de crédit',
        enabled: false,
      },
      {
        id: 'view_reports',
        name: 'Visualisation des Rapports',
        description: 'Accès aux tableaux de bord et rapports statistiques',
        enabled: false,
      },
      {
        id: 'manage_subsidies',
        name: 'Gestion des Subventions',
        description: 'Permet d\'attribuer et suivre les subventions aux SFDs',
        enabled: false,
      },
      {
        id: 'audit_logs',
        name: 'Journaux d\'Audit',
        description: 'Accès aux journaux d\'audit du système',
        enabled: false,
      },
      {
        id: 'export_data',
        name: 'Export des Données',
        description: 'Peut exporter les données du système',
        enabled: false,
      },
      {
        id: 'manage_sfd_users',
        name: 'Gestion des Utilisateurs SFD',
        description: 'Permet de gérer les utilisateurs associés à une SFD',
        enabled: false,
      },
    ]);
  }, []);
  
  const handleTogglePermission = (permId: string) => {
    setNewRole(prev => {
      const permissions = [...prev.permissions];
      if (permissions.includes(permId)) {
        return {
          ...prev,
          permissions: permissions.filter(id => id !== permId)
        };
      } else {
        return {
          ...prev,
          permissions: [...permissions, permId]
        };
      }
    });
  };
  
  const handleSaveNewRole = async () => {
    if (!newRole.name) {
      toast({
        title: 'Erreur',
        description: 'Le nom du rôle est obligatoire',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditMode) {
        // Update existing role
        const { data, error } = await supabase
          .from('admin_roles')
          .update({
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions
          })
          .eq('id', newRole.id);
        
        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: `Le rôle ${newRole.name} a été mis à jour`
        });
        
        // Update local state
        setRoles(prev => prev.map(role => 
          role.id === newRole.id ? {...role, ...newRole} : role
        ));
      } else {
        // Create new role
        const { data, error } = await supabase
          .from('admin_roles')
          .insert({
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions
          })
          .select();
        
        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: `Le rôle ${newRole.name} a été créé`
        });
        
        // Add to local state
        if (data && data[0]) {
          setRoles(prev => [...prev, data[0]]);
        }
      }
      
      // Reset form and close dialog
      setNewRole({ name: '', description: '', permissions: [] });
      setShowNewRoleDialog(false);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error saving role:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le rôle',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteRole = async (roleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      setIsLoading(true);
      
      try {
        const { error } = await supabase
          .from('admin_roles')
          .delete()
          .eq('id', roleId);
        
        if (error) throw error;
        
        // Update local state
        setRoles(prev => prev.filter(role => role.id !== roleId));
        
        toast({
          title: 'Succès',
          description: 'Le rôle a été supprimé'
        });
      } catch (err) {
        console.error('Error deleting role:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le rôle',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleEditRole = (role: AdminRole) => {
    setNewRole({
      ...role,
      id: role.id
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
