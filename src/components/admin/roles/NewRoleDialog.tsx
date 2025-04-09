
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminRolePermission, NewRoleData } from './types';
import { Loader2 } from 'lucide-react';

interface NewRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newRole: NewRoleData;
  permissions: AdminRolePermission[];
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onTogglePermission: (permId: string) => void;
  onSave: () => void;
  isLoading?: boolean;
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
  isLoading = false,
  isEditMode = false,
}: NewRoleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Modifier un rôle administrateur' : 'Créer un nouveau rôle administrateur'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="roleName" className="text-sm font-medium">
              Nom du rôle
            </label>
            <Input
              id="roleName"
              placeholder="Ex: Superviseur des opérations"
              value={newRole.name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="roleDescription" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="roleDescription"
              placeholder="Décrivez les responsabilités de ce rôle..."
              value={newRole.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-3">
              {permissions.map((perm) => (
                <div key={perm.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`perm-${perm.id}`}
                    checked={newRole.permissions.includes(perm.id)}
                    onCheckedChange={() => onTogglePermission(perm.id)}
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label
                      htmlFor={`perm-${perm.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {perm.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {perm.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Mettre à jour' : 'Créer le rôle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
