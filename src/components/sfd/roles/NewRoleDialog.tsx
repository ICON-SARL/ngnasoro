
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PermissionList } from '@/components/admin/roles/PermissionList';
import { Permission, NewRoleData } from './types';

interface NewRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newRole: NewRoleData;
  permissions: Permission[];
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onTogglePermission: (permissionId: string) => void;
  onSave: () => void;
  isEditMode?: boolean;
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
  isEditMode = false
}: NewRoleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier le Rôle' : 'Créer un Nouveau Rôle'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modifiez les détails et les permissions du rôle.' 
              : 'Définissez un nouveau rôle et ses permissions associées.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du rôle</Label>
            <Input 
              id="name" 
              placeholder="Nom du rôle" 
              value={newRole.name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Description du rôle" 
              value={newRole.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Permissions</Label>
            <PermissionList 
              permissions={permissions} 
              selectedPermissions={newRole.permissions || []} 
              onTogglePermission={onTogglePermission}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSave}>
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
