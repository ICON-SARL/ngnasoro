
import React from 'react';
import { Route } from 'react-router-dom';
import AgencyDashboard from '@/pages/AgencyDashboard';
import SfdLoansPage from '@/pages/SfdLoansPage';
import ClientsPage from '@/pages/ClientsPage';
import SfdAdhesionRequestsPage from '@/pages/SfdAdhesionRequestsPage';
import TransactionsPage from '@/pages/TransactionsPage';
import SfdSubsidyRequestsPage from '@/pages/SfdSubsidyRequestsPage';
import SfdMerefRequestPage from '@/pages/SfdMerefRequestPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/hooks/auth/types';

export const SfdAdminRoutes = () => {
  return (
    <>
      <Route path="/agency-dashboard/*" element={
        <ProtectedRoute requireSfdAdmin={true}>
          <RoleGuard requiredRole={UserRole.SfdAdmin}>
            <AgencyDashboard />
          </RoleGuard>
        </ProtectedRoute>
      } />
      
      <Route path="/sfd-loans" element={
        <ProtectedRoute requireSfdAdmin={true}>
          <RoleGuard requiredRole={UserRole.SfdAdmin}>
            <SfdLoansPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      
      <Route path="/sfd-clients" element={
        <ProtectedRoute requireSfdAdmin={true}>
          <RoleGuard requiredRole={UserRole.SfdAdmin}>
            <ClientsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      
      <Route path="/sfd-adhesion-requests" element={
        <ProtectedRoute requireSfdAdmin={true}>
          <RoleGuard requiredRole={UserRole.SfdAdmin}>
            <SfdAdhesionRequestsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      
      <Route path="/sfd-transactions" element={
        <ProtectedRoute requireSfdAdmin={true}>
          <RoleGuard requiredRole={UserRole.SfdAdmin}>
            <TransactionsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      
      <Route path="/sfd-subsidy-requests" element={
        <ProtectedRoute requireSfdAdmin={true}>
          <RoleGuard requiredRole={UserRole.SfdAdmin}>
            <SfdSubsidyRequestsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      
      <Route path="/sfd-meref-request" element={
        <ProtectedRoute requireSfdAdmin={true}>
          <RoleGuard requiredRole={UserRole.SfdAdmin}>
            <SfdMerefRequestPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      
      {/* Route partagée entre Admin et SFD Admin */}
      <Route path="/credit-approval" element={
        <ProtectedRoute>
          <CreditApprovalPage />
        </ProtectedRoute>
      } />
    </>
  );
};
