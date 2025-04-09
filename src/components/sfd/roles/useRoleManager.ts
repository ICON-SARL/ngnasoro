
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Role, Permission, NewRoleData } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useRoleManager() {
  const { activeSfdId } = useAuth();
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrateur SFD',
      description: 'Accès complet à la gestion de la SFD',
      permissions: ['manage_clients', 'manage_loans', 'approve_loans', 'manage_staff', 'view_reports', 'export_data']
    },
    {
      id: '2',
      name: 'Agent de crédit',
      description: 'Gestion des demandes de prêts et suivi des clients',
      permissions: ['view_clients', 'manage_loans', 'view_reports']
    },
    {
      id: '3',
      name: 'Caissier',
      description: 'Gestion des opérations de caisse',
      permissions: ['view_clients', 'process_transactions']
    }
  ]);

  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [newRole, setNewRole] = useState<NewRoleData>({
    name: '',
    description: '',
    permissions: []
  });

  const permissions: Permission[] = [
    { id: 'manage_clients', name: 'Gestion des clients', description: 'Ajouter, modifier et supprimer des clients' },
    { id: 'view_clients', name: 'Voir les clients', description: 'Consulter les informations des clients' },
    { id: 'manage_loans', name: 'Gestion des prêts', description: 'Créer et gérer des demandes de prêt' },
    { id: 'approve_loans', name: 'Approuver les prêts', description: 'Autorité finale pour approuver les demandes de prêt' },
    { id: 'process_transactions', name: 'Traiter les transactions', description: 'Effectuer des opérations de caisse (dépôts, retraits)' },
    { id: 'manage_staff', name: 'Gestion du personnel', description: 'Ajouter et gérer le personnel de la SFD' },
    { id: 'view_reports', name: 'Voir les rapports', description: 'Accès aux rapports et statistiques' },
    { id: 'export_data', name: 'Exporter les données', description: 'Exporter les données vers Excel ou PDF' },
    { id: 'manage_settings', name: 'Paramètres système', description: 'Modifier les paramètres de la SFD' },
    { id: 'view_audit_logs', name: 'Journal d\'audit', description: 'Consulter les journaux d\'activité' }
  ];

  const handleTogglePermission = (permissionId: string) => {
    setNewRole(prev => {
      const updatedPermissions = prev.permissions?.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...(prev.permissions || []), permissionId];
      
      return { ...prev, permissions: updatedPermissions };
    });
  };

  const handleSaveNewRole = async () => {
    if (!newRole.name) {
      toast({
        title: 'Erreur',
        description: 'Le nom du rôle est requis',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isEditMode && newRole.id) {
        // Update existing role
        // In a real implementation, this would update the role in the database
        setRoles(prevRoles => 
          prevRoles.map(role => 
            role.id === newRole.id 
              ? {
                  ...role,
                  name: newRole.name,
                  description: newRole.description || '',
                  permissions: newRole.permissions || []
                }
              : role
          )
        );
        
        toast({
          title: 'Rôle mis à jour',
          description: `Le rôle ${newRole.name} a été mis à jour avec succès`,
          variant: 'default'
        });
      } else {
        // Create new role
        const newId = Date.now().toString();
        const role: Role = {
          id: newId,
          name: newRole.name,
          description: newRole.description || '',
          permissions: newRole.permissions || []
        };

        setRoles([...roles, role]);
        
        toast({
          title: 'Rôle ajouté',
          description: `Le rôle ${role.name} a été créé avec succès`,
          variant: 'default'
        });
      }

      setNewRole({ name: '', description: '', permissions: [] });
      setShowNewRoleDialog(false);
      setIsEditMode(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive'
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

  const handleDeleteRole = (roleId: string) => {
    // In a real implementation, this would delete the role from the database
    setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
    
    toast({
      title: 'Rôle supprimé',
      description: 'Le rôle a été supprimé avec succès',
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
    handleSaveNewRole,
    handleDeleteRole,
    handleEditRole,
    isEditMode,
    setIsEditMode
  };
}
