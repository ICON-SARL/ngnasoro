
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Plus, Settings, UserCog, Shield, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const UserManagement = () => {
  const users = [
    {
      id: 1,
      name: 'Amadou Traoré',
      email: 'amadou@ngnasoro.ml',
      role: 'Administrateur',
      status: 'active',
      lastActive: '22 avril 2023',
    },
    {
      id: 2,
      name: 'Fatoumata Diallo',
      email: 'fatoumata@ngnasoro.ml',
      role: 'Agent de crédit',
      status: 'active',
      lastActive: '22 avril 2023',
    },
    {
      id: 3,
      name: 'Ibrahim Koné',
      email: 'ibrahim@ngnasoro.ml',
      role: 'Agent de guichet',
      status: 'active',
      lastActive: '21 avril 2023',
    },
    {
      id: 4,
      name: 'Mariam Coulibaly',
      email: 'mariam@ngnasoro.ml',
      role: 'Superviseur',
      status: 'inactive',
      lastActive: '15 avril 2023',
    },
    {
      id: 5,
      name: 'Oumar Touré',
      email: 'oumar@ngnasoro.ml',
      role: 'Agent de terrain',
      status: 'active',
      lastActive: '22 avril 2023',
    },
  ];

  const roles = [
    {
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités du système',
      userCount: 1,
      permissions: ['Gestion utilisateurs', 'Configuration', 'Rapports', 'Prêts', 'Transactions']
    },
    {
      name: 'Superviseur',
      description: 'Supervision des agents et approbation des opérations importantes',
      userCount: 2,
      permissions: ['Approbation prêts', 'Rapports', 'Supervision', 'Transactions']
    },
    {
      name: 'Agent de crédit',
      description: 'Traitement des demandes de prêt et évaluation des clients',
      userCount: 10,
      permissions: ['Gestion prêts', 'Rapports basiques', 'Clients']
    },
    {
      name: 'Agent de guichet',
      description: 'Traitement des transactions quotidiennes avec les clients',
      userCount: 7,
      permissions: ['Transactions', 'Clients']
    },
    {
      name: 'Agent de terrain',
      description: 'Collection mobile et prospection de nouveaux clients',
      userCount: 3,
      permissions: ['Mobile app', 'Clients', 'Collections']
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Gestion Multi-Collaborateurs</h2>
          <p className="text-sm text-muted-foreground">
            Système de contrôle d'accès basé sur les rôles (RBAC)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Rôles & Permissions
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter Utilisateur
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Collaborateurs</h3>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      user.role === 'Administrateur' 
                        ? 'bg-purple-50 text-purple-700' 
                        : user.role === 'Superviseur'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-green-50 text-green-700'
                    }>
                      {user.role}
                    </Badge>
                    <Badge className={
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Rôles & Permissions</h3>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="divide-y">
              {roles.map((role, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                        role.name === 'Administrateur' 
                          ? 'bg-purple-100 text-purple-700' 
                          : role.name === 'Superviseur'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {role.name === 'Administrateur' 
                          ? <Shield className="h-4 w-4" />
                          : <UserCog className="h-4 w-4" />
                        }
                      </div>
                      <h4 className="font-medium">{role.name}</h4>
                    </div>
                    <Badge variant="outline">
                      {role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.permissions.map((perm, i) => (
                      <Badge key={i} variant="outline" className="bg-gray-50">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 bg-blue-50">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Contrôle d'Accès Basé sur les Rôles (RBAC)</h3>
            <p className="text-sm text-blue-700 mt-1">
              Le système RBAC permet de définir précisément les permissions accordées à chaque rôle, 
              assurant ainsi que chaque utilisateur n'a accès qu'aux fonctionnalités nécessaires à 
              l'exercice de ses fonctions, conformément aux principes du moindre privilège.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
