
import React from 'react';
import { FinancialReports } from './reports/FinancialReports';
import RoleGuard from './RoleGuard';

export const FinancialReporting = () => {
  return (
    <RoleGuard requiredRole="sfd_admin">
      <FinancialReports />
    </RoleGuard>
  );
};
