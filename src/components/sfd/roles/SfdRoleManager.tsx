
import React from 'react';
import { RoleCard } from './RoleCard';
import { NewRoleDialog } from './NewRoleDialog';
import { useRoleManager } from './useRoleManager';

export function SfdRoleManager() {
  const {
    roles,
    permissions,
    showNewRoleDialog,
    setShowNewRoleDialog,
    newRole,
    setNewRole,
    handleTogglePermission,
    handleSaveNewRole
  } = useRoleManager();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Rôles SFD</h2>
        <NewRoleDialog
          isOpen={showNewRoleDialog}
          onOpenChange={setShowNewRoleDialog}
          newRole={newRole}
          permissions={permissions}
          onNameChange={(name) => setNewRole({ ...newRole, name })}
          onDescriptionChange={(description) => setNewRole({ ...newRole, description })}
          onTogglePermission={handleTogglePermission}
          onSave={handleSaveNewRole}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map(role => (
          <RoleCard 
            key={role.id} 
            role={role} 
            permissions={permissions} 
          />
        ))}
      </div>
    </div>
  );
}
