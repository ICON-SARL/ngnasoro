
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, User, Shield, Users, Mail, Key, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  has2FA: boolean;
  lastLogin: string;
}

export function AdminAccountsManager() {
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Amadou Konaté',
      email: 'admin@ngnasoro.ml',
      role: 'Super Admin',
      status: 'active',
      has2FA: true,
      lastLogin: 'Aujourd\'hui à 10:25'
    },
    {
      id: '2',
      name: 'Fatoumata Diallo',
      email: 'f.diallo@ngnasoro.ml',
      role: 'Administrateur SFD',
      status: 'active',
      has2FA: true,
      lastLogin: 'Hier à 15:30'
    },
    {
      id: '3',
      name: 'Ibrahim Touré',
      email: 'i.toure@ngnasoro.ml',
      role: 'Auditeur',
      status: 'active',
      has2FA: false,
      lastLogin: '20 avril à 09:15'
    }
  ]);

  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: '',
    require2FA: true
  });

  const roles = ['Super Admin', 'Administrateur SFD', 'Auditeur'];

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.role) {
      toast({
        title: 'Erreur',
        description: 'Tous les champs sont requis',
        variant: 'destructive'
      });
      return;
    }

    const admin: AdminUser = {
      id: Date.now().toString(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      status: 'active',
      has2FA: newAdmin.require2FA,
      lastLogin: 'Jamais'
    };

    setAdmins([...admins, admin]);
    
    toast({
      title: 'Administrateur ajouté',
      description: `${admin.name} a été ajouté en tant que ${admin.role}`,
    });
    
    setShowNewAdminDialog(false);
    setNewAdmin({
      name: '',
      email: '',
      role: '',
      require2FA: true
    });
  };

  const handleToggle2FA = (adminId: string) => {
    setAdmins(prevAdmins => 
      prevAdmins.map(admin => 
        admin.id === adminId 
          ? { ...admin, has2FA: !admin.has2FA }
          : admin
      )
    );
  };

  const handleToggleStatus = (adminId: string) => {
    setAdmins(prevAdmins => 
      prevAdmins.map(admin => 
        admin.id === adminId 
          ? { ...admin, status: admin.status === 'active' ? 'inactive' : 'active' }
          : admin
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestion des Comptes Administrateurs</h2>
          <p className="text-sm text-muted-foreground">
            Créez et gérez les comptes administrateurs avec différents niveaux d'accès
          </p>
        </div>
        
        <Dialog open={showNewAdminDialog} onOpenChange={setShowNewAdminDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Administrateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un administrateur</DialogTitle>
              <DialogDescription>
                Créez un nouveau compte administrateur avec les permissions appropriées.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={newAdmin.role}
                  onValueChange={(value) => setNewAdmin({...newAdmin, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between space-y-0 pt-2">
                <div className="flex flex-col">
                  <Label htmlFor="require2FA" className="mb-2">Exiger l'authentification à 2 facteurs</Label>
                  <span className="text-sm text-muted-foreground">
                    Renforce la sécurité du compte administrateur
                  </span>
                </div>
                <Switch 
                  id="require2FA"
                  checked={newAdmin.require2FA}
                  onCheckedChange={(checked) => setNewAdmin({...newAdmin, require2FA: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddAdmin}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                    admin.role === 'Super Admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : admin.role === 'Administrateur SFD'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {admin.role === 'Super Admin' 
                      ? <Shield className="h-5 w-5" />
                      : admin.role === 'Administrateur SFD'
                      ? <Users className="h-5 w-5" />
                      : <User className="h-5 w-5" />
                    }
                  </div>
                  <div>
                    <h4 className="font-medium">{admin.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      {admin.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={
                      admin.role === 'Super Admin' 
                        ? 'bg-purple-50 text-purple-700' 
                        : admin.role === 'Administrateur SFD'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }>
                      {admin.role}
                    </Badge>
                    
                    <Badge className={
                      admin.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {admin.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    
                    <Badge variant="outline" className={
                      admin.has2FA ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                    }>
                      <Lock className="h-3 w-3 mr-1" />
                      {admin.has2FA ? '2FA Activé' : '2FA Désactivé'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Dernière connexion: {admin.lastLogin}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggle2FA(admin.id)}
                >
                  <Key className="h-3.5 w-3.5 mr-1" />
                  {admin.has2FA ? 'Désactiver 2FA' : 'Activer 2FA'}
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(admin.id)}
                  className={admin.status === 'active' ? 'text-red-600' : 'text-green-600'}
                >
                  {admin.status === 'active' ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
