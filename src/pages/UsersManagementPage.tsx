
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { UserDetails } from '@/components/admin/UserDetails';

// Re-export the page component from admin/UsersManagementPage.tsx
// This file is a simple wrapper to ensure the import path in App.tsx works correctly
export default function UsersManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Administrez les utilisateurs et leurs associations aux SFDs
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content re-used from the existing UsersManagementPage implementation */}
          <div className="col-span-3 bg-white p-6 rounded-lg shadow border border-gray-100">
            <UserDetails userId="" />
          </div>
        </div>
      </div>
    </div>
  );
}
