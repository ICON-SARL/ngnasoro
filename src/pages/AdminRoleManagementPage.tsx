
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Card } from '@/components/ui/card';
import { AdminRoleManager } from '@/components/admin/roles/AdminRoleManager';

const AdminRoleManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Rôles Administrateurs</h1>
          <p className="text-muted-foreground">
            Définissez les rôles et permissions pour les administrateurs du système
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <AdminRoleManager />
        </div>
      </div>
    </div>
  );
};

export default AdminRoleManagementPage;
