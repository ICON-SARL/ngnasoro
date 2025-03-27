
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Role, Permission } from './types';

export function useRoleManager() {
  const [roles, setRoles] = useState<Role[]>([
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
  ]);

  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<{
    name: string;
    description?: string;
    permissions?: string[];
  }>({
    name: '',
    description: '',
    permissions: []
  });

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

  const handleTogglePermission = (permissionId: string) => {
    setNewRole(prev => {
      const updatedPermissions = prev.permissions?.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...(prev.permissions || []), permissionId];
      
      return { ...prev, permissions: updatedPermissions };
    });
  };

  const handleSaveNewRole = () => {
    if (!newRole.name) {
      toast({
        title: 'Erreur',
        description: 'Le nom du rôle est requis',
        variant: 'destructive'
      });
      return;
    }

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description || '',
      permissions: newRole.permissions || []
    };

    setRoles([...roles, role]);
    setNewRole({ name: '', description: '', permissions: [] });
    setShowNewRoleDialog(false);
    
    toast({
      title: 'Rôle ajouté',
      description: `Le rôle ${role.name} a été créé avec succès`,
      variant: 'default'
    });
  };

  return {
    roles,
    permissions,
    showNewRoleDialog,
    setShowNewRoleDialog,
    newRole,
    setNewRole,
    handleTogglePermission,
    handleSaveNewRole
  };
}
