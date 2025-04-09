
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Role, Permission } from './types';
import { RoleManagerState, NewRoleFormData, RoleManagerResult } from './roleManagerTypes';

export function useRoleManager(): RoleManagerResult {
  // Initialize with default roles
  const [state, setState] = useState<RoleManagerState>({
    roles: [
      {
        id: '1',
        name: 'Gérant',
        description: 'Accès complet aux fonctionnalités de la SFD',
        permissions: ['manage_clients', 'manage_loans', 'manage_users', 'view_reports', 'approve_loans']
      },
      {
        id: '2',
        name: 'Agent de Crédit',
        description: 'Gestion des clients et des prêts',
        permissions: ['manage_clients', 'create_loans', 'view_loans', 'view_clients']
      },
      {
        id: '3',
        name: 'Caissier',
        description: 'Gestion des transactions financières',
        permissions: ['manage_transactions', 'view_clients', 'view_loans']
      }
    ],
    showNewRoleDialog: false,
    isEditMode: false,
    editRoleId: null,
    newRole: {
      name: '',
      description: '',
      permissions: []
    }
  });

  // Define permissions separately from state to avoid deep nesting
  const permissions: Permission[] = [
    { id: 'manage_clients', name: 'Gérer les clients', description: 'Créer, modifier et supprimer des clients' },
    { id: 'view_clients', name: 'Afficher les clients', description: 'Voir les détails des clients' },
    { id: 'manage_loans', name: 'Gérer les prêts', description: 'Créer, modifier et supprimer des prêts' },
    { id: 'create_loans', name: 'Créer des prêts', description: 'Créer de nouveaux prêts' },
    { id: 'view_loans', name: 'Afficher les prêts', description: 'Voir les détails des prêts' },
    { id: 'approve_loans', name: 'Approuver les prêts', description: 'Approuver ou rejeter les demandes de prêts' },
    { id: 'manage_transactions', name: 'Gérer les transactions', description: 'Gérer les transactions financières' },
    { id: 'manage_users', name: 'Gérer les utilisateurs', description: 'Créer, modifier et supprimer des utilisateurs' },
    { id: 'view_reports', name: 'Afficher les rapports', description: 'Accéder aux rapports et statistiques' }
  ];

  // Use explicitly typed update functions to avoid deep type instantiations
  const setNewRole = (roleData: Partial<NewRoleFormData>) => {
    setState(prevState => ({
      ...prevState,
      newRole: {
        ...prevState.newRole,
        ...roleData
      }
    }));
  };

  const setShowNewRoleDialog = (show: boolean) => {
    setState(prevState => ({
      ...prevState,
      showNewRoleDialog: show
    }));
  };

  const handleTogglePermission = (permissionId: string) => {
    setState(prevState => {
      const currentPermissions = [...prevState.newRole.permissions];
      const updatedPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter(id => id !== permissionId)
        : [...currentPermissions, permissionId];
      
      return {
        ...prevState,
        newRole: {
          ...prevState.newRole,
          permissions: updatedPermissions
        }
      };
    });
  };

  const handleSaveNewRole = () => {
    if (!state.newRole.name) {
      toast({
        title: 'Erreur',
        description: 'Le nom du rôle est requis',
        variant: 'destructive'
      });
      return;
    }

    setState(prevState => {
      const { roles, newRole, editRoleId, isEditMode } = prevState;
      
      if (isEditMode && editRoleId) {
        // Update existing role - use explicit typing
        const updatedRoles: Role[] = [];
        for (const role of roles) {
          if (role.id === editRoleId) {
            updatedRoles.push({
              ...role,
              name: newRole.name,
              description: newRole.description,
              permissions: newRole.permissions
            });
          } else {
            updatedRoles.push(role);
          }
        }
        
        toast({
          title: 'Rôle mis à jour',
          description: `Le rôle ${newRole.name} a été mis à jour avec succès`,
          variant: 'default'
        });
        
        return {
          ...prevState,
          roles: updatedRoles,
          showNewRoleDialog: false,
          isEditMode: false,
          editRoleId: null,
          newRole: { name: '', description: '', permissions: [] }
        };
      } else {
        // Create new role
        const newRoleObject: Role = {
          id: Date.now().toString(),
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions
        };
        
        toast({
          title: 'Rôle ajouté',
          description: `Le rôle ${newRole.name} a été créé avec succès`,
          variant: 'default'
        });
        
        return {
          ...prevState,
          roles: [...roles, newRoleObject],
          showNewRoleDialog: false,
          newRole: { name: '', description: '', permissions: [] }
        };
      }
    });
  };

  // Return all the state and functions needed
  return {
    ...state,
    permissions,
    setNewRole,
    setShowNewRoleDialog,
    handleTogglePermission,
    handleSaveNewRole
  };
}
