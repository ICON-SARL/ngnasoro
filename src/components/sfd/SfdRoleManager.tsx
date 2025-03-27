
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Plus, User, Shield } from 'lucide-react';
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

export function SfdRoleManager() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Gérant',
      description: 'Accès complet aux fonctionnalités de la SFD',
      permissions: ['manage_clients', 'manage_loans', 'manage_users', 'view_reports', 'approve_loans']
    },
    {
      id: '2',
      name: 'Agent de Crédit',
      description: 'Gestion des clients et des prêts',
      permissions: ['manage_clients', 'create_loans', 'view_loans', 'view_clients']
    },
    {
      id: '3',
      name: 'Caissier',
      description: 'Gestion des transactions financières',
      permissions: ['manage_transactions', 'view_clients', 'view_loans']
    }
  ]);

  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: []
  });

  const permissions: Permission[] = [
    { id: 'manage_clients', name: 'Gérer les clients', description: 'Créer, modifier et supprimer des clients' },
    { id: 'view_clients', name: 'Afficher les clients', description: 'Voir les détails des clients' },
    { id: 'manage_loans', name: 'Gérer les prêts', description: 'Créer, modifier et supprimer des prêts' },
    { id: 'create_loans', name: 'Créer des prêts', description: 'Créer de nouveaux prêts' },
    { id: 'view_loans', name: 'Afficher les prêts', description: 'Voir les détails des prêts' },
    { id: 'approve_loans', name: 'Approuver les prêts', description: 'Approuver ou rejeter les demandes de prêts' },
    { id: 'manage_transactions', name: 'Gérer les transactions', description: 'Gérer les transactions financières' },
    { id: 'manage_users', name: 'Gérer les utilisateurs', description: 'Créer, modifier et supprimer des utilisateurs' },
    { id: 'view_reports', name: 'Afficher les rapports', description: 'Accéder aux rapports et statistiques' }
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
        <h2 className="text-xl font-semibold">Gestion des Rôles SFD</h2>
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
                  role.name === 'Gérant' 
                    ? 'bg-blue-100 text-blue-700' 
                    : role.name === 'Agent de Crédit'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {role.name === 'Gérant' 
                    ? <Shield className="h-4 w-4" />
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
