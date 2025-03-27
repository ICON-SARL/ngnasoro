
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Plus, User, Users, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export function AdminRoleManager() {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Rôles Administratifs</h2>
        <Dialog open={showNewRoleDialog} onOpenChange={setShowNewRoleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rôle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau rôle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du rôle</Label>
                <Input 
                  id="name" 
                  value={newRole.name} 
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  value={newRole.description || ''} 
                  onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Permissions</Label>
                <div className="border rounded-md p-3 space-y-3">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground">{permission.description}</div>
                      </div>
                      <Switch 
                        checked={newRole.permissions?.includes(permission.id) || false}
                        onCheckedChange={() => handleTogglePermission(permission.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveNewRole}>Enregistrer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map(role => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                  role.name === 'Super Admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : role.name === 'Administrateur SFD'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {role.name === 'Super Admin' 
                    ? <Shield className="h-4 w-4" />
                    : role.name === 'Administrateur SFD'
                    ? <Users className="h-4 w-4" />
                    : <User className="h-4 w-4" />
                  }
                </div>
                <CardTitle>{role.name}</CardTitle>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-sm font-medium">Permissions</div>
                <div className="grid grid-cols-2 gap-2">
                  {role.permissions.map(permId => {
                    const permission = permissions.find(p => p.id === permId);
                    return permission ? (
                      <div key={permId} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        {permission.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm">Modifier</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
