
import React, { useState, useEffect } from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { AdminUsersList } from '@/components/admin/shared/AdminUsersList';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function UsersListPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Liste de tous les utilisateurs de la plateforme
          </p>
        </div>
        
        <div className="flex justify-end mb-4">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <AdminUsersList />
        </div>
      </div>
    </div>
  );
}
