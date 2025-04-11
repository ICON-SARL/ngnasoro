
import React from 'react';
import { RoleCard } from './RoleCard';
import { NewRoleDialog } from './NewRoleDialog';
import { useRoleManager } from './useRoleManager';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function SfdRoleManager() {
  const {
    roles,
    permissions,
    showNewRoleDialog,
    setShowNewRoleDialog,
    newRole,
    setNewRole,
    handleTogglePermission,
    handleSaveNewRole,
    handleEditRole,
    handleDeleteRole,
    isEditMode
  } = useRoleManager();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Rôles SFD</h2>
        <Button onClick={() => setShowNewRoleDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Rôle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map(role => (
          <RoleCard 
            key={role.id} 
            role={role} 
            permissions={permissions}
            onEdit={() => handleEditRole(role)}
            onDelete={() => handleDeleteRole(role.id)}
          />
        ))}
      </div>
      
      <NewRoleDialog
        isOpen={showNewRoleDialog}
        onOpenChange={setShowNewRoleDialog}
        newRole={newRole}
        permissions={permissions}
        onNameChange={(name) => setNewRole({ ...newRole, name })}
        onDescriptionChange={(description) => setNewRole({ ...newRole, description })}
        onTogglePermission={handleTogglePermission}
        onSave={handleSaveNewRole}
        isEditMode={isEditMode}
      />
    </div>
  );
}
