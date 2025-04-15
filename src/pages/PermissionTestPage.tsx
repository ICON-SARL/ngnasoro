
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { PermissionSystemStatus } from '@/components/admin/PermissionSystemStatus';
import { RoleTester } from '@/components/admin/RoleTester';
import { RoleChecker } from '@/components/RoleChecker';
import { useAuth } from '@/hooks/auth';

const PermissionTestPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Test et Vérification du Système de Permissions</h1>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <PermissionSystemStatus />
          <RoleTester />
          
          {user && (
            <div className="lg:col-span-2">
              <RoleChecker userId={user.id} role={user.app_metadata?.role || 'user'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PermissionTestPage;
