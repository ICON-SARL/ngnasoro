
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import { Permission, Role, NewRoleData } from './types';

export function useRoleManager() {
  const { activeSfdId } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newRole, setNewRole] = useState<NewRoleData>({
    name: '',
    description: '',
    permissions: []
  });

  // Fetch roles and permissions
  useEffect(() => {
    if (activeSfdId) {
      fetchRoles();
      fetchPermissions();
    }
  }, [activeSfdId]);

  const fetchRoles = async () => {
    if (!activeSfdId) return;

    try {
      // For now, we'll use mock data since we're having issues with Supabase
      const defaultRoles = getDefaultRoles();
      setRoles(defaultRoles);

      // Store in localStorage for persistence
      localStorage.setItem(`sfd_roles_${activeSfdId}`, JSON.stringify(defaultRoles));
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback to default roles
      setRoles(getDefaultRoles());
    }
  };

  const fetchPermissions = async () => {
    try {
      // Use mock data since we don't have the sfd_permissions table yet
      setPermissions(getDefaultPermissions());
      
      // Store in localStorage for persistence
      localStorage.setItem('sfd_permissions', JSON.stringify(getDefaultPermissions()));
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(getDefaultPermissions());
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setNewRole(prev => {
      const hasPermission = prev.permissions.includes(permissionId);
      if (hasPermission) {
        return {
          ...prev,
          permissions: prev.permissions.filter(id => id !== permissionId)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permissionId]
        };
      }
    });
  };

  const handleSaveNewRole = async () => {
    if (!newRole.name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du rôle est requis.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditMode && newRole.id) {
        // Update existing role
        const updatedRole: Role = {
          id: newRole.id,
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions
        };
        
        const roleIndex = roles.findIndex(role => role.id === newRole.id);
        if (roleIndex !== -1) {
          const updatedRoles = [...roles];
          updatedRoles[roleIndex] = updatedRole;
          setRoles(updatedRoles);
          
          // Store in localStorage
          if (activeSfdId) {
            localStorage.setItem(`sfd_roles_${activeSfdId}`, JSON.stringify(updatedRoles));
          }
          
          toast({
            title: "Rôle mis à jour",
            description: `Le rôle "${newRole.name}" a été mis à jour avec succès.`
          });
        }
      } else {
        // Create new role
        const newRoleWithId: Role = {
          id: uuidv4(),
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions
        };
        
        const updatedRoles = [...roles, newRoleWithId];
        setRoles(updatedRoles);
        
        // Store in localStorage
        if (activeSfdId) {
          localStorage.setItem(`sfd_roles_${activeSfdId}`, JSON.stringify(updatedRoles));
        }
        
        toast({
          title: "Rôle créé",
          description: `Le rôle "${newRole.name}" a été créé avec succès.`
        });
      }
      
      // Reset form
      setNewRole({
        name: '',
        description: '',
        permissions: []
      });
      setIsEditMode(false);
      setShowNewRoleDialog(false);
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du rôle.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);
      
      // Update localStorage
      if (activeSfdId) {
        localStorage.setItem(`sfd_roles_${activeSfdId}`, JSON.stringify(updatedRoles));
      }
      
      toast({
        title: "Rôle supprimé",
        description: "Le rôle a été supprimé avec succès."
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du rôle.",
        variant: "destructive"
      });
    }
  };

  const handleEditRole = (role: Role) => {
    setNewRole({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setIsEditMode(true);
    setShowNewRoleDialog(true);
  };

  return {
    roles,
    permissions,
    showNewRoleDialog,
    setShowNewRoleDialog,
    newRole,
    setNewRole,
    handleTogglePermission,
    handleSaveNewRole,
    handleDeleteRole,
    handleEditRole,
    isEditMode
  };
}

// Helper functions to provide default data
function getDefaultRoles(): Role[] {
  return [
    {
      id: '1',
      name: 'Caissier',
      description: 'Gère les opérations de caisse et les transactions en agence',
      permissions: ['transaction_deposit', 'transaction_withdraw']
    },
    {
      id: '2',
      name: 'Agent de Crédit',
      description: 'Évalue les demandes de crédit et gère les dossiers de prêt',
      permissions: ['loan_create', 'loan_approve', 'client_view']
    },
    {
      id: '3',
      name: 'Manager d\'Agence',
      description: 'Supervise les opérations quotidiennes de l\'agence',
      permissions: ['transaction_deposit', 'transaction_withdraw', 'loan_create', 'loan_approve', 'client_view', 'client_create', 'report_view']
    }
  ];
}

function getDefaultPermissions(): Permission[] {
  return [
    { id: 'client_view', name: 'Consulter les clients', description: 'Voir les informations des clients' },
    { id: 'client_create', name: 'Créer des clients', description: 'Ajouter de nouveaux clients' },
    { id: 'client_edit', name: 'Modifier les clients', description: 'Modifier les informations des clients existants' },
    { id: 'loan_create', name: 'Créer des prêts', description: 'Initier des demandes de prêt' },
    { id: 'loan_approve', name: 'Approuver des prêts', description: 'Valider les demandes de prêt' },
    { id: 'loan_disburse', name: 'Débloquer des prêts', description: 'Effectuer le décaissement des prêts approuvés' },
    { id: 'transaction_deposit', name: 'Dépôts', description: 'Enregistrer les dépôts clients' },
    { id: 'transaction_withdraw', name: 'Retraits', description: 'Effectuer des retraits pour les clients' },
    { id: 'report_view', name: 'Voir les rapports', description: 'Accéder aux rapports et statistiques' },
    { id: 'report_export', name: 'Exporter les rapports', description: 'Exporter les rapports en PDF ou Excel' },
  ];
}
