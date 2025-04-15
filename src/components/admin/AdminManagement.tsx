
import React from 'react';
import { AdminManagementPage } from './management';
import RoleGuard from '../RoleGuard';
import { UserRole } from '@/utils/auth/roleTypes';

export function AdminManagement() {
  return (
    <RoleGuard requiredRole={UserRole.ADMIN}>
      <AdminManagementPage />
    </RoleGuard>
  );
}

export default AdminManagement;
