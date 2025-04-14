
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { AdminUsersList } from '@/components/admin/shared/AdminUsersList';

export default function UsersListPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Administrez les utilisateurs et leurs rôles
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <AdminUsersList />
        </div>
      </div>
    </div>
  );
}
