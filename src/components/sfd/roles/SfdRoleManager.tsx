
import React, { useState } from 'react';
import { useRoleManager } from './useRoleManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Role, Permission } from './types';

export const SfdRoleManager = () => {
  const {
    roles,
    permissions,
    showNewRoleDialog,
    newRole,
    isEditMode,
    setShowNewRoleDialog,
    setNewRole,
    handleTogglePermission,
    handleSaveNewRole
  } = useRoleManager();

  // Gestionnaire pour l'édition d'un rôle
  const handleEditRole = (role: Role) => {
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setShowNewRoleDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Rôles</h1>
        <Button 
          onClick={() => {
            setNewRole({ name: '', description: '', permissions: [] });
            setShowNewRoleDialog(true);
          }}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouveau Rôle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-start">
                <span>{role.name}</span>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Permissions:</h3>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permId) => {
                    const perm = permissions.find(p => p.id === permId);
                    return (
                      <Badge key={permId} variant="outline" className="text-xs">
                        {perm?.name || permId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showNewRoleDialog} onOpenChange={setShowNewRoleDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Modifier le rôle' : 'Nouveau rôle'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du rôle</Label>
              <Input
                id="name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Ex: Administrateur, Agent, Caissier..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Description des responsabilités de ce rôle..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={newRole.permissions.includes(permission.id)}
                      onCheckedChange={() => handleTogglePermission(permission.id)}
                    />
                    <div className="grid gap-0.5">
                      <Label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNewRoleDialog(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSaveNewRole} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              {isEditMode ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
