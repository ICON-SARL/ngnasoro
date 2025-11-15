
import React from 'react';
import ModernAdminAuthUI from '@/components/auth/ModernAdminAuthUI';
import { AdminSystemSetup } from '@/components/admin/setup/AdminSystemSetup';

const AdminLoginPage = () => {
  return (
    <div className="space-y-8">
      <ModernAdminAuthUI />
      <AdminSystemSetup />
    </div>
  );
};

export default AdminLoginPage;
