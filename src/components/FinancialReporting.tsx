
import React from 'react';
import { FinancialReports } from './reports/FinancialReports';
import RoleGuard from './RoleGuard';
import { Role } from '@/utils/audit/auditPermissions';

export const FinancialReporting = () => {
  return (
    <RoleGuard requiredRole="sfd_admin">
      <FinancialReports />
    </RoleGuard>
  );
};
