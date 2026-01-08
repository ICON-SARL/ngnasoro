import React from 'react';
import UnifiedModernAuthUI from '@/components/auth/UnifiedModernAuthUI';
import { AdminSystemSetup } from '@/components/admin/setup/AdminSystemSetup';

const AdminLoginPage = () => {
  return (
    <div className="space-y-8">
      <UnifiedModernAuthUI mode="admin" />
      <AdminSystemSetup />
    </div>
  );
};

export default AdminLoginPage;
