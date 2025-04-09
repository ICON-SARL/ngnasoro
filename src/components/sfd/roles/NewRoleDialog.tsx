
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NewRoleData, Permission } from './types';
import { PermissionList } from './PermissionList';

interface NewRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newRole: NewRoleData;
  permissions: Permission[];
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onTogglePermission: (permissionId: string) => void;
  onSave: () => void;
  isEditMode: boolean;
}

export function NewRoleDialog({
  isOpen,
  onOpenChange,
  newRole,
  permissions,
  onNameChange,
  onDescriptionChange,
  onTogglePermission,
  onSave,
  isEditMode,
}: NewRoleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Modifier le Rôle' : 'Nouveau Rôle'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="role-name" className="text-sm font-medium">
              Nom du Rôle
            </label>
            <Input
              id="role-name"
              value={newRole.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ex: Caissier, Agent de Crédit..."
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="role-description"
              value={newRole.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Description des responsabilités de ce rôle..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Permissions</label>
            <PermissionList
              permissions={permissions}
              selectedPermissions={newRole.permissions}
              onTogglePermission={onTogglePermission}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={onSave}
            disabled={!newRole.name.trim()}
          >
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
