
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
import { User, Key, Mail, Shield, Bell, CheckSquare } from 'lucide-react';
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
import AuthenticationSystem from '@/components/AuthenticationSystem';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  has2FA: boolean;
  lastActive: string;
  status: 'active' | 'inactive';
}

export function AdminAccountsManager() {
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Admin Principal',
      email: 'admin@ngnasoro.ml',
      role: 'Super Admin',
      has2FA: true,
      lastActive: '25 avril 2023',
      status: 'active',
    },
    {
      id: '2',
      name: 'Gestionnaire SFD',
      email: 'sfd@ngnasoro.ml',
      role: 'Administrateur SFD',
      has2FA: false,
      lastActive: '24 avril 2023',
      status: 'active',
    },
    {
      id: '3',
      name: 'Auditeur Système',
      email: 'audit@ngnasoro.ml',
      role: 'Auditeur',
      has2FA: true,
      lastActive: '22 avril 2023',
      status: 'active',
    }
  ]);

  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);
  const [showEnroll2FADialog, setShowEnroll2FADialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: '',
    enable2FA: false,
    sendNotification: true
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

    const adminUser: AdminUser = {
      id: Date.now().toString(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      has2FA: newAdmin.enable2FA,
      lastActive: 'Jamais',
      status: 'active'
    };

    setAdmins([...admins, adminUser]);
    
    toast({
      title: 'Administrateur ajouté',
      description: `${adminUser.name} a été ajouté en tant que ${adminUser.role}`,
    });
    
    if (newAdmin.sendNotification) {
      toast({
        title: 'Notification envoyée',
        description: `Un email a été envoyé à ${adminUser.email}`,
      });
    }
    
    if (newAdmin.enable2FA) {
      setShowNewAdminDialog(false);
      setShowEnroll2FADialog(true);
    } else {
      setShowNewAdminDialog(false);
      setNewAdmin({
        name: '',
        email: '',
        role: '',
        enable2FA: false,
        sendNotification: true
      });
    }
  };

  const handle2FAComplete = () => {
    setShowEnroll2FADialog(false);
    setNewAdmin({
      name: '',
      email: '',
      role: '',
      enable2FA: false,
      sendNotification: true
    });
    
    toast({
      title: 'Configuration 2FA terminée',
      description: 'L\'authentification à deux facteurs a été activée pour ce compte',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Comptes Administrateurs</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les comptes administrateurs et leurs accès au système
          </p>
        </div>
        
        <Dialog open={showNewAdminDialog} onOpenChange={setShowNewAdminDialog}>
          <DialogTrigger asChild>
            <Button>
              <User className="h-4 w-4 mr-2" />
              Nouvel Administrateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel administrateur</DialogTitle>
              <DialogDescription>
                Créez un nouveau compte administrateur avec les permissions spécifiques.
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
                  <Label htmlFor="enable2fa" className="mb-2">Activer 2FA</Label>
                  <span className="text-sm text-muted-foreground">
                    Exiger l'authentification à deux facteurs
                  </span>
                </div>
                <Switch 
                  id="enable2fa"
                  checked={newAdmin.enable2FA}
                  onCheckedChange={(checked) => setNewAdmin({...newAdmin, enable2FA: checked})}
                />
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
                  checked={newAdmin.sendNotification}
                  onCheckedChange={(checked) => setNewAdmin({...newAdmin, sendNotification: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddAdmin}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted/40">
          <div className="relative">
            <Label htmlFor="search-admin" className="sr-only">Rechercher</Label>
            <Input
              id="search-admin"
              placeholder="Rechercher par nom ou email..."
              className="pl-10"
            />
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="divide-y">
          {admins.map((admin) => (
            <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{admin.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" />
                    {admin.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={
                      admin.role === 'Super Admin' 
                        ? 'bg-purple-50 text-purple-700' 
                        : admin.role === 'Administrateur SFD'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-green-50 text-green-700'
                    }>
                      {admin.role}
                    </Badge>
                    {admin.has2FA && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        <Shield className="h-3 w-3 mr-1" /> 2FA
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    Dernière activité: {admin.lastActive}
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

      {/* 2FA Enrollment Dialog */}
      <Dialog open={showEnroll2FADialog} onOpenChange={setShowEnroll2FADialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configuration de l'authentification à deux facteurs</DialogTitle>
            <DialogDescription>
              Veuillez suivre les étapes pour configurer l'authentification à deux facteurs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AuthenticationSystem 
              mode="enrollment" 
              onComplete={handle2FAComplete}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
