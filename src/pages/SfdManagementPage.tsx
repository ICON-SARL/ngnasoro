
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { AdminNotifications } from '@/components/admin/shared/AdminNotifications';

export default function SfdManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader 
        additionalComponents={<AdminNotifications />}
      />
      <div className="container mx-auto py-6 px-4">
        <SfdManagement />
      </div>
    </div>
  );
}
