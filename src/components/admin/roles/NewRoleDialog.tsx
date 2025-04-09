
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit } from 'lucide-react';
import { PermissionList } from './PermissionList';
import { Permission } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NewRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newRole: {
    name: string;
    description?: string;
    permissions?: string[];
  };
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
      <DialogTrigger asChild>
        <Button>
          {isEditMode ? (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Modifier Rôle
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rôle
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier un rôle' : 'Créer un nouveau rôle'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du rôle</Label>
            <Input 
              id="name" 
              value={newRole.name} 
              onChange={e => onNameChange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={newRole.description || ''} 
              onChange={e => onDescriptionChange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Permissions</Label>
            <Tabs defaultValue="list">
              <TabsList className="mb-4">
                <TabsTrigger value="list">Liste</TabsTrigger>
                <TabsTrigger value="drag">Glisser-déposer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                <PermissionList 
                  permissions={permissions}
                  selectedPermissions={newRole.permissions || []}
                  onTogglePermission={onTogglePermission}
                  draggable={false}
                />
              </TabsContent>
              
              <TabsContent value="drag">
                <PermissionList 
                  permissions={permissions}
                  selectedPermissions={newRole.permissions || []}
                  onTogglePermission={onTogglePermission}
                  draggable={true}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-end">
            <Button onClick={onSave}>
              {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
