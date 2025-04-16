
import React from 'react';
import { AdminManagementPage } from './management';
import RoleGuard from '../RoleGuard';
import { UserRole } from '@/hooks/auth/types';

export function AdminManagement() {
  return (
    <RoleGuard requiredRole={UserRole.SuperAdmin}>
      <AdminManagementPage />
    </RoleGuard>
  );
}

export default AdminManagement;
