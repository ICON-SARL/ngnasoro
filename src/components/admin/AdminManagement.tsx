
import React from 'react';
import { AdminManagementPage } from './management';
import RoleGuard from '../RoleGuard';
import { Role } from '@/utils/audit/auditPermissions';

export function AdminManagement() {
  return (
    <RoleGuard requiredRole={Role.ADMIN}>
      <AdminManagementPage />
    </RoleGuard>
  );
}

export default AdminManagement;
