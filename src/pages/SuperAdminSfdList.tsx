
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdManagement } from '@/components/admin/SfdManagement';

const SuperAdminSfdList: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">SFD Management</h1>
          <p className="text-muted-foreground">
            Manage all registered SFD agencies and their configurations
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <SfdManagement />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSfdList;
