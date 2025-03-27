
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { User, Mail, Shield, Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SfdUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

export function SfdUserManagement() {
  const [users, setUsers] = useState<SfdUser[]>([
    {
      id: '1',
      name: 'Gérant Principal',
      email: 'gerant@ngnasoro.ml',
      role: 'Gérant',
      status: 'active',
      lastActive: '24 avril 2023',
    },
    {
      id: '2',
      name: 'Agent de Crédit',
      email: 'agent@ngnasoro.ml',
      role: 'Agent de Crédit',
      status: 'active',
      lastActive: '23 avril 2023',
    },
    {
      id: '3',
      name: 'Caissier',
      email: 'caissier@ngnasoro.ml',
      role: 'Caissier',
      status: 'active',
      lastActive: '22 avril 2023',
    }
  ]);

  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    sendNotification: true
  });

  const roles = ['Gérant', 'Agent de Crédit', 'Caissier', 'Agent de Terrain'];

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        title: 'Erreur',
        description: 'Tous les champs sont requis',
        variant: 'destructive'
      });
      return;
    }

    const sfdUser: SfdUser = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      lastActive: 'Jamais',
      status: 'active'
    };

    setUsers([...users, sfdUser]);
    
    toast({
      title: 'Utilisateur ajouté',
      description: `${sfdUser.name} a été ajouté en tant que ${sfdUser.role}`,
    });
    
    if (newUser.sendNotification) {
      toast({
        title: 'Notification envoyée',
        description: `Un email a été envoyé à ${sfdUser.email}`,
      });
    }
    
    setShowNewUserDialog(false);
    setNewUser({
      name: '',
      email: '',
      role: '',
      sendNotification: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestion des utilisateurs SFD</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les comptes utilisateurs de votre SFD
          </p>
        </div>
        
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Créez un nouveau compte utilisateur avec des permissions spécifiques.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
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
                  <Label htmlFor="sendNotification" className="mb-2">Envoyer une notification</Label>
                  <span className="text-sm text-muted-foreground">
                    Envoyer un email d'invitation
                  </span>
                </div>
                <Switch 
                  id="sendNotification"
                  checked={newUser.sendNotification}
                  onCheckedChange={(checked) => setNewUser({...newUser, sendNotification: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted/40">
          <div className="relative">
            <Label htmlFor="search-user" className="sr-only">Rechercher</Label>
            <Input
              id="search-user"
              placeholder="Rechercher par nom ou email..."
              className="pl-10"
            />
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="divide-y">
          {users.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{user.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" />
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={
                      user.role === 'Gérant' 
                        ? 'bg-blue-50 text-blue-700' 
                        : user.role === 'Agent de Crédit'
                        ? 'bg-green-50 text-green-700'
                        : user.role === 'Caissier'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-purple-50 text-purple-700'
                    }>
                      {user.role}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    Dernière activité: {user.lastActive}
                  </span>
                </div>
                
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
