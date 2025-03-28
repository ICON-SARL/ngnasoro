
import React from 'react';
import { UserManagementHeader } from './UserManagementHeader';
import { UsersList, UserItem } from './UsersList';
import { RolesList, RoleItem } from './RolesList';
import { InfoPanel } from './InfoPanel';

export const UserManagement = () => {
  const users: UserItem[] = [
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

  const roles: RoleItem[] = [
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
      <UserManagementHeader 
        title="Gestion Multi-Collaborateurs" 
        description="Système de contrôle d'accès basé sur les rôles (RBAC)" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <UsersList users={users} />
        <RolesList roles={roles} />
      </div>
      
      <InfoPanel />
    </div>
  );
};
