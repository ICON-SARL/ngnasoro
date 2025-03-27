
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Role, Permission } from './types';

export function useRoleManager() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Accès complet au système',
      permissions: ['all_access', 'manage_users', 'manage_sfds', 'manage_subsidies', 'manage_audit_logs', 'manage_settings']
    },
    {
      id: '2',
      name: 'Administrateur SFD',
      description: 'Gestion des SFDs et des subventions',
      permissions: ['manage_sfds', 'manage_subsidies', 'view_audit_logs']
    },
    {
      id: '3',
      name: 'Auditeur',
      description: 'Lecture seule des journaux et rapports',
      permissions: ['view_audit_logs', 'view_sfds', 'view_subsidies']
    }
  ]);

  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: []
  });

  const permissions: Permission[] = [
    { id: 'all_access', name: 'Accès complet', description: 'Accès à toutes les fonctionnalités du système' },
    { id: 'manage_users', name: 'Gestion des utilisateurs', description: 'Créer, modifier et supprimer des utilisateurs' },
    { id: 'manage_sfds', name: 'Gestion des SFDs', description: 'Créer, modifier et supprimer des SFDs' },
    { id: 'manage_subsidies', name: 'Gestion des subventions', description: 'Allouer et gérer les subventions' },
    { id: 'view_sfds', name: 'Afficher les SFDs', description: 'Voir les détails des SFDs sans pouvoir les modifier' },
    { id: 'view_subsidies', name: 'Afficher les subventions', description: 'Voir les subventions sans pouvoir les modifier' },
    { id: 'manage_audit_logs', name: 'Gestion des journaux d\'audit', description: 'Configurer et gérer les journaux d\'audit' },
    { id: 'view_audit_logs', name: 'Afficher les journaux d\'audit', description: 'Voir les journaux d\'audit sans pouvoir les modifier' },
    { id: 'manage_settings', name: 'Gestion des paramètres', description: 'Configurer les paramètres système' }
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
